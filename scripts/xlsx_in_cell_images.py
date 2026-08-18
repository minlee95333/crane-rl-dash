"""저장된 .xlsx 의 한 열을 Excel "셀 안 이미지(Place in Cell)" 로 바꾼다.

openpyxl 이 넣는 그림은 시트 위에 떠 있는 도형(drawing)이라 셀의 값이 아니다.
Excel 365 가 쓰는 '셀 안 이미지'는 셀 값 자체가 rich value 인 별도 구조다:

    시트 셀        <c r="V2" t="e" vm="1"><v>#VALUE!</v></c>
      └ vm=1  →  xl/metadata.xml  valueMetadata 1번
                   └ XLRICHVALUE rvb i="0"
                       └ xl/richData/rdrichvalue.xml  rv 0번
                           └ _rvRel:LocalImageIdentifier = 0
                               └ xl/richData/richValueRel.xml  rel 0번 → rId1
                                   └ .../_rels/richValueRel.xml.rels → ../media/xxx.png

openpyxl 에 이 구조를 만드는 API 가 없어서, 저장이 끝난 zip 을 다시 써서 파트를
직접 넣는다. 표준 OOXML 이 아니라 MS 확장이라 **Excel 2021 이하·LibreOffice 에서는
#VALUE! 로 보인다.** 그런 곳에서도 보여야 하면 떠 있는 그림을 써야 한다.
"""
from __future__ import annotations

import re
import shutil
import zipfile
from pathlib import Path

NS_RICHDATA = "http://schemas.microsoft.com/office/spreadsheetml/2017/richdata"
NS_RICHVALUEREL = "http://schemas.microsoft.com/office/spreadsheetml/2022/richvaluerel"
NS_R = "http://schemas.openxmlformats.org/officeDocument/2006/relationships"
NS_MAIN = "http://schemas.openxmlformats.org/spreadsheetml/2006/main"

REL_RDRICHVALUE = "http://schemas.microsoft.com/office/2017/06/relationships/rdRichValue"
REL_RDSTRUCT = "http://schemas.microsoft.com/office/2017/06/relationships/rdRichValueStructure"
REL_RICHVALUEREL = "http://schemas.microsoft.com/office/2022/10/relationships/richValueRel"
REL_METADATA = f"{NS_R}/sheetMetadata"
REL_IMAGE = f"{NS_R}/image"

CT = {
    "/xl/richData/rdrichvalue.xml": "application/vnd.ms-excel.rdrichvalue+xml",
    "/xl/richData/rdrichvaluestructure.xml": "application/vnd.ms-excel.rdrichvaluestructure+xml",
    "/xl/richData/richValueRel.xml": "application/vnd.ms-excel.richvaluerel+xml",
    "/xl/metadata.xml": (
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheetMetadata+xml"),
}


def _structure_xml() -> str:
    return (
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        f'<rvStructures xmlns="{NS_RICHDATA}" count="1">'
        '<s t="_localImage">'
        '<k n="_rvRel:LocalImageIdentifier" t="i"/>'
        '<k n="CalcOrigin" t="i"/>'
        '</s></rvStructures>'
    )


def _richvalue_xml(n: int) -> str:
    # v[0] = richValueRel 인덱스, v[1] = CalcOrigin(5 = 셀에 삽입된 로컬 이미지)
    body = "".join(f'<rv s="0"><v>{i}</v><v>5</v></rv>' for i in range(n))
    return (
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        f'<rvData xmlns="{NS_RICHDATA}" count="{n}">{body}</rvData>'
    )


def _richvaluerel_xml(n: int) -> str:
    body = "".join(f'<rel r:id="rId{i + 1}"/>' for i in range(n))
    return (
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        f'<richValueRels xmlns="{NS_RICHVALUEREL}" xmlns:r="{NS_R}">{body}</richValueRels>'
    )


def _richvaluerel_rels_xml(names: list[str]) -> str:
    body = "".join(
        f'<Relationship Id="rId{i + 1}" Type="{REL_IMAGE}" Target="../media/{name}"/>'
        for i, name in enumerate(names)
    )
    return (
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        f'<Relationships xmlns="{NS_R}">{body}</Relationships>'
    )


def _metadata_xml(n: int) -> str:
    future = "".join(
        '<bk><extLst><ext uri="{3e2802c4-a4d2-4d8b-9148-e3be6c30e623}">'
        f'<xlrd:rvb i="{i}"/></ext></extLst></bk>'
        for i in range(n)
    )
    values = "".join(f'<bk><rc t="1" v="{i}"/></bk>' for i in range(n))
    return (
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        f'<metadata xmlns="{NS_MAIN}" '
        'xmlns:xlrd="http://schemas.microsoft.com/office/spreadsheetml/2017/richdata">'
        '<metadataTypes count="1">'
        '<metadataType name="XLRICHVALUE" minSupportedVersion="120000" copy="1" '
        'pasteAll="1" pasteValues="1" merge="1" splitFirst="1" rowColShift="1" '
        'clearFormats="1" clearComments="1" assign="1" coerce="1"/>'
        '</metadataTypes>'
        f'<futureMetadata name="XLRICHVALUE" count="{n}">{future}</futureMetadata>'
        f'<valueMetadata count="{n}">{values}</valueMetadata>'
        '</metadata>'
    )


def _patch_content_types(xml: str) -> str:
    if 'Extension="png"' not in xml:
        xml = xml.replace("<Types ", '<Types ', 1)
        xml = re.sub(
            r"(<Types[^>]*>)",
            r'\1<Default Extension="png" ContentType="image/png"/>',
            xml, count=1,
        )
    adds = "".join(
        f'<Override PartName="{part}" ContentType="{ctype}"/>'
        for part, ctype in CT.items()
        if f'PartName="{part}"' not in xml
    )
    return xml.replace("</Types>", adds + "</Types>")


def _patch_workbook_rels(xml: str) -> str:
    existing = set(re.findall(r'Id="(rId\d+)"', xml))
    n = 1
    def next_id() -> str:
        nonlocal n
        while f"rId{n}" in existing:
            n += 1
        existing.add(f"rId{n}")
        return f"rId{n}"

    adds = []
    for rel_type, target in (
        (REL_METADATA, "metadata.xml"),
        (REL_RDRICHVALUE, "richData/rdrichvalue.xml"),
        (REL_RDSTRUCT, "richData/rdrichvaluestructure.xml"),
        (REL_RICHVALUEREL, "richData/richValueRel.xml"),
    ):
        if f'Type="{rel_type}"' in xml:
            continue
        adds.append(
            f'<Relationship Id="{next_id()}" Type="{rel_type}" Target="{target}"/>')
    return xml.replace("</Relationships>", "".join(adds) + "</Relationships>")


def _patch_sheet(xml: str, cells: dict[str, int]) -> tuple[str, int]:
    """`cells` = {셀주소: vm 인덱스(1부터)}. 바꾼 셀 수를 함께 돌려준다."""
    patched = 0
    for ref, vm in cells.items():
        pattern = re.compile(
            rf'<c r="{ref}"(?P<attrs>[^>]*?)(?:/>|>.*?</c>)', re.DOTALL)
        match = pattern.search(xml)
        if not match:
            continue
        style = re.search(r'\ss="\d+"', match.group("attrs"))
        style = style.group(0) if style else ""
        replacement = f'<c r="{ref}"{style} t="e" vm="{vm}"><v>#VALUE!</v></c>'
        xml = xml[: match.start()] + replacement + xml[match.end():]
        patched += 1
    return xml, patched


def convert(path: Path, images: dict[str, bytes], sheet_part: str = "xl/worksheets/sheet1.xml") -> int:
    """`images` = {셀주소: PNG 바이트}. 셀 안 이미지로 바꾼 개수를 돌려준다.

    zip 은 덧붙일 수 없으므로 통째로 다시 쓴다. 원본은 .bak 으로 남긴다.
    """
    if not images:
        return 0
    refs = list(images)
    media_names = [f"sig{i + 1}.png" for i in range(len(refs))]
    vm_of = {ref: i + 1 for i, ref in enumerate(refs)}

    src = Path(path)
    backup = src.with_suffix(src.suffix + ".bak")
    shutil.copy2(src, backup)

    with zipfile.ZipFile(backup) as zin:
        entries = {item.filename: zin.read(item.filename) for item in zin.infolist()}

    if sheet_part not in entries:
        raise SystemExit(f"{sheet_part} 가 없다 — 시트 파트 이름을 확인할 것.")

    sheet_xml, patched = _patch_sheet(entries[sheet_part].decode("utf-8"), vm_of)
    if patched != len(refs):
        raise SystemExit(f"셀 치환 실패: {patched}/{len(refs)}")
    entries[sheet_part] = sheet_xml.encode("utf-8")

    entries["[Content_Types].xml"] = _patch_content_types(
        entries["[Content_Types].xml"].decode("utf-8")).encode("utf-8")
    entries["xl/_rels/workbook.xml.rels"] = _patch_workbook_rels(
        entries["xl/_rels/workbook.xml.rels"].decode("utf-8")).encode("utf-8")

    for name, ref in zip(media_names, refs):
        entries[f"xl/media/{name}"] = images[ref]
    entries["xl/metadata.xml"] = _metadata_xml(len(refs)).encode("utf-8")
    entries["xl/richData/rdrichvaluestructure.xml"] = _structure_xml().encode("utf-8")
    entries["xl/richData/rdrichvalue.xml"] = _richvalue_xml(len(refs)).encode("utf-8")
    entries["xl/richData/richValueRel.xml"] = _richvaluerel_xml(len(refs)).encode("utf-8")
    entries["xl/richData/_rels/richValueRel.xml.rels"] = (
        _richvaluerel_rels_xml(media_names).encode("utf-8"))

    with zipfile.ZipFile(src, "w", zipfile.ZIP_DEFLATED) as zout:
        # [Content_Types].xml 이 먼저 오는 관례를 지킨다.
        zout.writestr("[Content_Types].xml", entries.pop("[Content_Types].xml"))
        for name, data in entries.items():
            zout.writestr(name, data)
    backup.unlink()
    return len(refs)
