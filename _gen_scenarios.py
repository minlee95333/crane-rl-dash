# -*- coding: utf-8 -*-
"""Deterministic scenario layout generator → prints a Python literal for SCENARIOS.
Run:  python -X utf8 _gen_scenarios.py
Generates 21 scenarios over difficulty 1-5 (counts 3/5/5/5/3), assigns weights/
heights inversely (heavy=low) so reach stays positive, places restricted zones,
puts lifts INSIDE zones from ★3 (near edges so a crane outside can reach in), and
VERIFIES every lift is solvable before emitting.
"""
import math, random, json
from crane_core.env import CraneSchedulingEnv

SITE = 100.0
M = 12.0  # margin

# difficulty → recipe
R = {
    1: dict(count=3, cranes=1, lifts=3,  zones=0, in_zone=0, weights=[10],            zs=[0],          cr=22),
    2: dict(count=5, cranes=2, lifts=7,  zones=0, in_zone=0, weights=[8,10,12,14],    zs=[0,4],        cr=22),
    3: dict(count=5, cranes=2, lifts=10, zones=1, in_zone=1, weights=[8,12,16,18],    zs=[0,4,10],     cr=20),
    4: dict(count=5, cranes=3, lifts=13, zones=2, in_zone=3, weights=[8,12,16,20],    zs=[0,6,12,16],  cr=20),
    5: dict(count=3, cranes=3, lifts=17, zones=2, in_zone=4, weights=[8,12,16,20,24], zs=[0,8,14,18],  cr=20),
}
# height assigned INVERSELY to weight so heavy loads stay liftable
def z_for(w, zs):
    # lighter -> higher z (more height challenge), heavier -> low z
    order = sorted(set(zs))
    if w <= 8:  return order[-1]
    if w <= 12: return order[min(len(order)-1, max(0, len(order)-2))] if len(order)>1 else order[-1]
    if w <= 16: return order[1] if len(order)>2 else order[0]
    return order[0]

CRANE_ANCHORS = {
    1: [(50,18)],
    2: [(18,22),(82,22)],
    3: [(16,18),(84,18),(50,86)],
}

def gen_layout(d, seed):
    rng = random.Random(seed)
    rec = R[d]
    cranes = [{"id":f"C{i+1}","x":float(x),"y":float(y)} for i,(x,y) in enumerate(CRANE_ANCHORS[rec['cranes']])]
    # zones first (so we can place in-zone lifts)
    zones=[]
    for zi in range(rec['zones']):
        zw = rng.uniform(12, 18); zh = rng.uniform(10, 16)
        zx = rng.uniform(M, SITE-M-zw); zy = rng.uniform(35, SITE-M-zh)  # keep zones in mid/upper area
        zones.append({"id":f"RZ{zi+1}","x1":round(zx,1),"y1":round(zy,1),"x2":round(zx+zw,1),"y2":round(zy+zh,1)})
    lifts=[]; lid=1
    wpool=rec['weights']
    MINSP=8.0  # minimum spacing between lifts so they don't overlap
    def too_close(x,y):
        return any(math.hypot(x-l['x'], y-l['y']) < MINSP for l in lifts)
    # in-zone lifts: light weight, placed inside a zone (anywhere in interior; the
    # solvability re-roll below rejects any that end up unreachable from outside).
    for k in range(rec['in_zone']):
        z=zones[k % len(zones)]
        ok=False
        for _try in range(120):
            lx=rng.uniform(z['x1']+2.5, z['x2']-2.5); ly=rng.uniform(z['y1']+2.5, z['y2']-2.5)
            if not too_close(lx,ly): ok=True; break
        if not ok: return None  # zone too cramped for spacing → re-roll whole scenario
        w=8.0  # keep in-zone light → big reach
        lifts.append({"id":f"L{lid}","x":round(lx,1),"y":round(ly,1),"weight_t":w,"z":float(z_for(w,rec['zs']))}); lid+=1
    # remaining lifts in 2-3 clusters, avoiding zones + each other
    nclu = 2 if rec['lifts']<=8 else 3
    centers=[(rng.uniform(25,75), rng.uniform(28,72)) for _ in range(nclu)]
    while lid <= rec['lifts']:
        cx,cy=centers[(lid)%nclu]
        placed=None
        for _try in range(120):
            lx=min(SITE-6,max(6,cx+rng.uniform(-18,18))); ly=min(SITE-6,max(6,cy+rng.uniform(-18,18)))
            if any(z['x1']<=lx<=z['x2'] and z['y1']<=ly<=z['y2'] for z in zones): continue
            if too_close(lx,ly): continue
            placed=(lx,ly); break
        if placed is None:
            return None  # couldn't space this lift → re-roll whole scenario
        w=float(wpool[(lid)%len(wpool)])
        lifts.append({"id":f"L{lid}","x":round(placed[0],1),"y":round(placed[1],1),"weight_t":w,"z":float(z_for(w,rec['zs']))}); lid+=1
    return {"cranes":cranes,"lifts":lifts,"restrictedZones":zones}

def solvable(layout, cr):
    env=CraneSchedulingEnv({"crane_radius":cr,"crane_capacity_chart":DEFAULT_CHART,
                            "num_cranes":len(layout['cranes']),"num_lifts":len(layout['lifts'])})
    env.reset_layout(layout['cranes'],layout['lifts'],layout['restrictedZones'])
    bad=[]
    for li,l in enumerate(env.lifts):
        if not any(not env.candidate_outcome(ci,li)['restricted'] for ci in range(env.nC)):
            bad.append(l.id)
    env._co_cache.clear()
    return bad

from crane_core.scenarios import DEFAULT_CAPACITY_CHART as DEFAULT_CHART

# Height ladder for the randomized standard+ heights (metres).
Z_LADDER = [0.0, 4.0, 6.0, 8.0, 10.0, 12.0, 14.0, 16.0, 18.0]

def randomize_heights(layout, cr, seed):
    """Difficulty >= 3 (표준 이상): give each lift a RANDOM placement height for
    variety, but only from the set of heights a 50t-class crane can still lift
    that exact lift (rated-load chart + height derating, via candidate_outcome —
    the same feasibility the game enforces). Heavy loads therefore stay low and
    light loads can go high, all while every lift remains solvable. z-only: x/y
    and everything else are untouched, so the layout's coordinates don't move."""
    env = CraneSchedulingEnv({"crane_radius": cr, "crane_capacity_chart": DEFAULT_CHART,
                              "num_cranes": len(layout['cranes']), "num_lifts": len(layout['lifts'])})
    env.reset_layout(layout['cranes'], layout['lifts'], layout['restrictedZones'])
    rng = random.Random(seed * 97 + 13)
    for li, (l_obj, l_dict) in enumerate(zip(env.lifts, layout['lifts'])):
        feasible = []
        for z in Z_LADDER:
            l_obj.z = z
            env._co_cache.clear()
            for ci in range(env.nC):
                o = env.candidate_outcome(ci, li)
                if o.get('restricted'):
                    continue
                m = o.get('capacityMargin')
                if m is None or m >= -1e-9:
                    feasible.append(z)
                    break
        chosen = rng.choice(feasible) if feasible else 0.0
        l_obj.z = chosen
        l_dict['z'] = float(chosen)
    env._co_cache.clear()

TIER_FOR={1:"tutorial",2:"tutorial",3:"standard",4:"expert",5:"expert"}
NAME={1:"입문",2:"기초",3:"표준",4:"고급",5:"전문"}
specs=[]
for d in [1,2,3,4,5]:
    made=0; seed=d*1000
    while made < R[d]['count']:
        seed+=1
        lay=gen_layout(d,seed)
        if lay is None:  # spacing failed → re-roll
            continue
        bad=solvable(lay,R[d]['cr'])
        if bad:  # re-roll
            continue
        # 표준 이상(난이도 3~5)은 높이를 랜덤하게 다양화(50t 작업 가능 범위 내).
        # 튜토리얼/기초(1~2)는 z_for의 낮은 높이 그대로 둔다.
        if d >= 3:
            randomize_heights(lay, R[d]['cr'], seed)
        made+=1
        inzone=sum(1 for l in lay['lifts'] if any(z['x1']<=l['x']<=z['x2'] and z['y1']<=l['y']<=z['y2'] for z in lay['restrictedZones']))
        specs.append({"id":f"D{d}_{made}","tier":TIER_FOR[d],"difficulty":d,
                      "name":f"★{d} {NAME[d]} {made}","description":f"난이도 {d} · 크레인 {len(lay['cranes'])} · 양중 {len(lay['lifts'])} · 제한구역 {len(lay['restrictedZones'])}"+(f" · 구역내 양중 {inzone}" if inzone else ""),
                      "cr":R[d]['cr'],"layout":lay})

# distribution check
from collections import Counter
print("// 분포:", dict(sorted(Counter(s['difficulty'] for s in specs).items())))
print("// 총:", len(specs))
# write data module (JSON is valid Python for this data: only numbers/str/list/dict)
header = ('# -*- coding: utf-8 -*-\n'
         '"""Auto-generated fixed-scenario layouts (21 maps, difficulty 1-5, counts 3/5/5/5/3).\n'
         'Edit lift/crane/zone coordinates here to tune. Regenerate via _gen_scenarios.py.\n'
         'Each spec: {id, tier, difficulty, name, description, cr(crane_radius), layout}.\n'
         'lifts carry weight_t + z (height); stars >=3 place some lifts inside restricted zones."""\n\n')
with open('crane_core/scenarios_data.py','w',encoding='utf-8') as f:
    f.write(header + 'SCEN_SPECS = ' + json.dumps(specs, ensure_ascii=False, indent=1) + '\n')
print('// wrote crane_core/scenarios_data.py')
