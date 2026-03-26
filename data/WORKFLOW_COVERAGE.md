# Workflow Coverage Audit
_Generated: 2026-03-26_

This document maps all 29 VAI™ workflows against available assets: swimlane diagrams, ROI data, step-level diagram data, and DB seeding status.

---

## Legend

| Symbol | Meaning |
|--------|---------|
| ✅ | Available / complete |
| ⚠️ | Partially available |
| ❌ | Missing |

---

## Coverage Matrix

| ID | Name | Swimlane File | ROI Data | Diagram Steps | In DB Seed |
|----|------|:---:|:---:|:---:|:---:|
| WF-01-VIDEO | Video | ❌ | ❌ | ❌ | ✅ |
| WF-02-VIDSRCH | Video Search | ❌ | ❌ | ❌ | ✅ |
| WF-03-RTTHRT | RT Threat | ❌ | ❌ | ❌ | ✅ |
| **WF-04-GUNSHOT** | **Gun Shot** | ✅ `shots_fired_swimlane` | ✅ | ✅ webp | ✅ |
| **WF-05-ACSCTR** | **Access Control** | ✅ `access_control_breach_swimlane` | ✅ | ✅ webp | ✅ |
| WF-06-STSVL | Site Surveillance | ❌ | ❌ | ❌ | ✅ |
| WF-07-TOFWATCH | TofFra Watch | ❌ | ❌ | ❌ | ✅ |
| WF-08-MRNDIG | Morning Digest | ❌ | ❌ | ❌ | ✅ |
| **WF-09-DSPAGT** | **Dispatch Agent** | ✅ `generic_911_swimlane` | ✅ | ✅ webp | ✅ |
| WF-10-CALLCOM | Call Comm. | ❌ | ❌ | ❌ | ✅ |
| WF-11-PARKENF | Parking Enf. | ❌ | ❌ | ❌ | ✅ |
| WF-12-PRMCMP | Permit Compl. | ❌ | ❌ | ❌ | ✅ |
| WF-13-WTHR | Weather | ❌ | ✅ | ✅ steps | ✅ |
| WF-14-TRAFQ | Traffic Queue | ❌ | ✅ | ✅ steps | ✅ |
| WF-15-PLNCLS | Planned Closure | ❌ | ✅ | ✅ steps | ✅ |
| WF-16-CRITINC | Critical Incident | ❌ | ✅ | ✅ steps | ✅ |
| WF-17-MLTCOM | Multi Com. Mgt | ❌ | ✅ | ✅ steps | ✅ |
| WF-18-FRRYFLD | Ferry Flood | ❌ | ✅ | ✅ steps | ✅ |
| WF-19-TRAFINC | Traffic Incident | ❌ | ✅ | ✅ steps | ✅ |
| WF-20-CMPRPT | Compliance Report | ❌ | ✅ | ✅ steps | ✅ |
| **WF-21-ILLDMP** | **Illegal Dumping** | ✅ `illegal_dumping_swimlane` | ✅ | ✅ webp | ✅ |
| **WF-22-CROWD** | **Crowd Counting** | ✅ `crowd_management_swimlane` | ✅ | ✅ webp | ✅ |
| WF-23-UNTLUG | Unattended Luggage | ❌ | ❌ | ❌ | ✅ |
| **WF-24-STVEH** | **Stolen Veh.** | ✅ `lpr_hotplate_swimlane` | ✅ | ✅ webp | ✅ |
| WF-25-PERDN | Person Down | ❌ | ❌ | ❌ | ✅ |
| WF-26-FRKLT | Forklift | ❌ | ❌ | ❌ | ✅ |
| WF-27-UNTVEH | Unattended Veh. | ❌ | ❌ | ❌ | ✅ |
| WF-28-BOXROT | Box Rotation | ❌ | ❌ | ❌ | ✅ |
| WF-29-FLNPRD | Fallen Products | ❌ | ❌ | ❌ | ✅ |

---

## Summary

| Asset Type | Count | Workflows |
|------------|------:|-----------|
| **Swimlane files received** | 6 / 29 | WF-04, WF-05, WF-09, WF-21, WF-22, WF-24 |
| **ROI data complete** | 14 / 29 | WF-04, WF-05, WF-09, WF-13–WF-20, WF-21, WF-22, WF-24 |
| **Diagram (steps or webp)** | 14 / 29 | WF-04, WF-05, WF-09, WF-13–WF-20, WF-21, WF-22, WF-24 |
| **In DB seed** | 29 / 29 | All workflows |
| **Any asset present** | 14 / 29 | WF-04, WF-05, WF-09, WF-13–WF-20, WF-21, WF-22, WF-24 |
| **Fully covered (ROI + diagram + DB)** | 14 / 29 | WF-04, WF-05, WF-09, WF-13–WF-20, WF-21, WF-22, WF-24 |
| **DB only — no diagram or ROI yet** | 15 / 29 | WF-01–WF-03, WF-06–WF-08, WF-10–WF-12, WF-23, WF-25–WF-29 |

---

## Swimlane File → Workflow Mapping

| Swimlane File | Maps to | Confidence | Notes |
|---------------|---------|:---:|-------|
| `shots_fired_swimlane` | WF-04-GUNSHOT | High | 5-phase municipal response: call intake → dispatch → containment → search → closure. Roles: 911 Operator, Patrol, EMS, SWAT, Investigations. |
| `access_control_breach_swimlane` | WF-05-ACSCTR | High | 5-phase municipal response: detection → verification → containment → LE response → remediation. Roles: SOC, On-site Security, IT/Access Control, Patrol, Investigations. |
| `generic_911_swimlane` | WF-09-DSPAGT | Medium | Generic 911 intake + dispatch pipeline. Roles: 911 Operator, Patrol, Fire/EMS, Investigations. Covers the dispatch triage and routing logic central to WF-09. |
| `illegal_dumping_swimlane` | WF-21-ILLDMP | High | 5-phase municipal enforcement: detection → initial response → investigation → enforcement → remediation. Roles: Master Coordinator, Hazmat, Environmental Agency, Law Enforcement, Public Works. |
| `crowd_management_swimlane` | WF-22-CROWD | High | 5-phase crowd response with 3-level severity scale. Roles: EOC/Dispatch, Crowd Management Coordinator, Venue Security, Patrol, Fire/EMS. |
| `lpr_hotplate_swimlane` | WF-24-STVEH | High | 5-phase LPR hit response: detection → verification → tactical response → apprehension → case closure. Roles: Dispatch, Patrol, Investigations, Records/Intel, Support Services. |

---

## Priority Gaps

### Tier 1 — High-priority workflows with no assets yet
These workflows are referenced in the Use Case Map and/or are core to active sales verticals:

| ID | Name | Referenced In |
|----|------|--------------|
| WF-03-RTTHRT | RT Threat | Police – Crowd Control, Venue – Event Security |
| WF-23-UNTLUG | Unattended Luggage | Venue – Event Security |
| WF-25-PERDN | Person Down | Warehouse – Worker Safety |
| WF-27-UNTVEH | Unattended Veh. | Enterprise – Site Security, Police – Vehicle Enforcement |
| WF-11-PARKENF | Parking Enf. | Police – Vehicle Enforcement |
| WF-26-FRKLT | Forklift | Warehouse – Worker Safety |

### Tier 2 — Supporting workflows with no assets yet
| ID | Name | Notes |
|----|------|-------|
| WF-01-VIDEO | Video | Foundation layer for all CV workflows |
| WF-02-VIDSRCH | Video Search | High-value for law enforcement and enterprise |
| WF-06-STSVL | Site Surveillance | Enterprise & industrial accounts |
| WF-07-TOFWATCH | TofFra Watch | Transit/transportation vertical |
| WF-08-MRNDIG | Morning Digest | Shift handover reporting |
| WF-10-CALLCOM | Call Comm. | 911/dispatch integration |
| WF-12-PRMCMP | Permit Compl. | Smart city/environmental |
| WF-28-BOXROT | Box Rotation | Logistics/warehouse |
| WF-29-FLNPRD | Fallen Products | Retail/logistics |

---

## Next Steps

- [x] Swimlane files identified and mapped (6 files → 6 workflows)
- [x] Convert 6 HTML swimlanes → `.webp` images (`public/diagrams/`) — 129–217 KB each
- [x] All 29 workflows confirmed in DB
- [x] ROI data added for 6 swimlane workflows in `workflow-static-data.ts`
- [x] Diagram tab shows swimlane webp for WF-04, WF-05, WF-09, WF-21, WF-22, WF-24
- [ ] Request swimlane files for Tier 1 priority gaps (6 workflows)
- [ ] Request swimlane files for remaining 9 Tier 2 workflows
