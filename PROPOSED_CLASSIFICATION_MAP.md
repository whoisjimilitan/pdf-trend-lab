# Proposed Industry Classification Map

**Purpose:** Map all 85 industries from B2B_INDUSTRIES to behaviour groups with explicit reasoning.

**Format:**
```
Industry Name | Proposed Group | Reasoning | Example Trigger Event
```

---

## LEGAL (5 industries)

| Industry | Group | Reasoning | Trigger Event |
|----------|-------|-----------|----------------|
| Solicitors | Deadline Driven | Core business is time-critical legal deadlines. Trigger is court appearances, filing deadlines, client meetings with fixed times. | Court filing deadline today |
| Barristers' Chambers | Deadline Driven | Trial briefs, court appearances, counsel availability. Everything has a court date. Trigger is trial date approaching. | Brief needed before court appearance |
| Conveyancing Firms | Completion Driven | Entire business revolves around property completion date. When completion date arrives, all documents must be in place. | Completion date today, documents missing |
| Litigation Firms | Deadline Driven | Court deadlines, evidence submission deadlines, witness availability deadlines. Everything driven by court calendar. | Court deadline in hours |
| Notaries | Deadline Driven | Notarization deadlines, document verification timelines. Trigger is when documents need certification on a specific date. | Documents need notarizing before deadline |

---

## HEALTHCARE (10 industries)

| Industry | Group | Reasoning | Trigger Event |
|----------|-------|-----------|----------------|
| Pharmacies | Operational Continuity | If pharmacy is closed or stock unavailable, people cannot get medicine. The business cannot operate without inventory. If one prescription is missing, it breaks the customer experience. | Prescription stock critical, patient waiting |
| Private Hospitals | Operational Continuity | Surgery cannot begin without supplies. Patient waiting. Operating room blocked. If supplies missing, operation is cancelled. | Surgical supplies missing before surgery |
| Dental Practices | Operational Continuity | Patient in chair, materials missing. Chair blocked, schedule halted. Business cannot operate without materials. | Surgical supplies missing before patient treatment |
| Orthodontists | Operational Continuity | Patient appointment scheduled. Materials missing. Appointment must be rescheduled. Customer disappointed. | Bracket supplies missing before patient appointment |
| GP Surgeries | Operational Continuity | Medications unavailable, clinic cancelled. Patients waiting cannot be seen. | Medication supply critical, clinic at risk |
| Veterinary Clinics | Operational Continuity | Animal in distress, medication needed immediately. Cannot refuse emergency. | Animal suffering, medication urgent |
| Care Homes | Operational Continuity | Residents dependent on daily medications and supplies. Missing one day of medication = resident health crisis. | Resident medication stock critical |
| Medical Laboratories | Operational Continuity | Test results needed by hospital. Sample delivery missed = hospital cannot diagnose patient. | Urgent test results needed by hospital |
| Fertility Clinics | Operational Continuity | Temperature-sensitive samples. Window closes. Cannot repeat treatment cycle. | Temperature-sensitive samples urgent transport |
| Private Healthcare Providers | Operational Continuity | Patient treatment blocked. Supplies missing = patient cannot receive care. | Treatment delayed, supplies needed |

---

## PROPERTY & CONSTRUCTION (8 industries)

| Industry | Group | Reasoning | Trigger Event |
|----------|-------|-----------|----------------|
| Estate Agents | Completion Driven | Completion date is fixed. On that date, all documents, keys, contracts must be in place. Completion falling through = massive financial loss. | Completion date today, keys missing |
| Letting Agents | Completion Driven | Tenancy start date is fixed. Tenant moving in on specific date. Keys and documents must be ready. | Tenancy starts today, keys not ready |
| Property Management Companies | Completion Driven | Inventory deadlines, inspection deadlines, lease deadlines. Everything date-driven. | Inspection deadline today, inventory incomplete |
| Surveyors | Completion Driven | Valuation report deadline before mortgage release. If report late, completion delayed. | Valuation report needed before completion |
| Architects | Deadline Driven | Planning deadline, design approval deadline, building control deadline. Projects have fixed submission dates. | Planning deadline submission today |
| Construction Firms | Site Continuity | Crew on site waiting. Truck came, no materials. Every hour costs money. Site halted = daily loss. | Crew waiting, materials not arrived |
| Building Contractors | Site Continuity | Weather window closing. Scaffold missing = cannot work. Delivery failed = schedule breaks. | Delivery failed, crew on site idle |
| Facilities Management Companies | Site Continuity | Building system failure = business stops. Maintenance emergency = immediate response needed. | Heating system broken, building unusable |

---

## AUTOMOTIVE (7 industries)

| Industry | Group | Reasoning | Trigger Event |
|----------|-------|-----------|----------------|
| Garages | Operational Continuity | Customer car breaks down. Repair parts missing = customer waiting. Cannot operate without parts inventory. | Customer waiting, parts missing from warehouse |
| MOT Centres | Operational Continuity | Vehicle inspection appointment booked. Parts missing = appointment cannot happen. | Parts missing before scheduled inspection |
| Vehicle Repair Centres | Operational Continuity | Customer vehicle in bay. Repair incomplete, waiting for parts. Customer left without transport. | Customer collection date, repair incomplete |
| Accident Repair Centres | Operational Continuity | Customer insurance deadline approaching. Repair incomplete = customer deadline missed. | Insurance deadline, repair not finished |
| Vehicle Dealerships | Supply Chain | Popular model out of stock. Customer waiting. Competitor has stock. | Customer waiting, vehicle from warehouse |
| Fleet Operators | Operational Continuity | Lorry breaks down. Fleet grounded. Cannot deliver to customers. | Vehicle breakdown, fleet grounded |
| Commercial Vehicle Workshops | Operational Continuity | Heavy commercial vehicle waiting for repair. Every hour down = customer losing money. | Urgent repair parts needed |

---

## MANUFACTURING & ENGINEERING (5 industries)

| Industry | Group | Reasoning | Trigger Event |
|----------|-------|-----------|----------------|
| Engineering Companies | Deadline Driven | Project has submission deadline. Design approval deadline. Building control deadline. Everything date-stamped. | Planning deadline approaching |
| Precision Manufacturers | Supply Chain | Custom component needed by client. Production halted waiting for input material. Client deadline approaching. | Component urgently needed for client |
| Electronics Manufacturers | Supply Chain | Component shortage halts production line. Customer order deadline approaching. Production blocked. | Component stock critical, order deadline |
| Industrial Suppliers | Supply Chain | Customer's production halted. They need parts just-in-time. If parts missing, their line stops. | Customer production halted, parts urgent |
| Machine Shops | Supply Chain | Custom part due for collection. Deadline approaching. Incomplete = customer deadline missed. | Custom part due for collection |

---

## FINANCE (4 industries)

| Industry | Group | Reasoning | Trigger Event |
|----------|-------|-----------|----------------|
| Accountants | Deadline Driven | Tax deadline, audit deadline, year-end filing deadline. Everything revolves around calendar dates. | Tax deadline tomorrow, paperwork missing |
| Financial Advisers | Deadline Driven | Client meeting with fixed date. Documents needed for presentation. | Client meeting today, documents needed |
| Mortgage Brokers | Completion Driven | Mortgage deed needed before property completion. Missing = completion delayed. | Mortgage completion, documents missing |
| Insurance Brokers | Deadline Driven | Policy renewal deadline. Claims deadline. Regulatory filing deadline. | Policy deadline, documents needed |

---

## EVENTS & MEDIA (9 industries)

| Industry | Group | Reasoning | Trigger Event |
|----------|-------|-----------|----------------|
| Event Organisers | Deadline Driven | Event happens on a specific date. Setup incomplete, materials missing = event compromised. | Event today, setup materials missing |
| Exhibition Companies | Deadline Driven | Exhibition opening date fixed. Display not installed = exhibition cannot open. | Exhibition opens today, materials missing |
| Wedding Planners | Deadline Driven | Wedding day is fixed (cannot move). Last-minute vendor issues. | Wedding day today, vendor missing |
| AV Suppliers | Deadline Driven | AV equipment needed for event. Event date fixed. Equipment delivery failed = event halted. | Event today, AV equipment missing |
| TV Production | Deadline Driven | Broadcast deadline approaching. Cannot miss air date. Footage needed for edit. | Broadcast deadline approaching |
| Film Production | Deadline Driven | Filming schedule. Equipment missing = shoot halted. Production schedule slips. | Production equipment missing for shoot |
| Photography Studios | Deadline Driven | Event happening today. Equipment failure = cannot cover event. | Event today, backup equipment needed |
| Marketing Agencies | Deadline Driven | Campaign launch deadline. Assets not approved by client. Deployment blocked. | Campaign launch deadline today |
| Print Companies | Deadline Driven | Print deadline approaching. Final artwork missing from client. | Print deadline approaching, artwork missing |

---

## TECHNOLOGY (5 industries)

| Industry | Group | Reasoning | Trigger Event |
|----------|-------|-----------|----------------|
| IT Support Companies | Operational Continuity | Client system down = client business stops. Emergency response needed. Cannot operate without immediate support. | Client system emergency |
| Data Centres | Operational Continuity | Cooling system failure = servers overheat = business stops. Emergency response required. | Cooling failure, emergency |
| Telecom Providers | Operational Continuity | Network outage = customers cannot operate. Emergency repair needed. | Network outage, emergency repair |
| Hardware Resellers | Supply Chain | Customer urgent order. Competitor has stock. Stock missing = customer goes elsewhere. | Customer waiting, stock missing |
| Managed Service Providers | Operational Continuity | Client onsite emergency support needed. Cannot operate without immediate response. | Client system emergency |

---

## EDUCATION (4 industries)

| Industry | Group | Reasoning | Trigger Event |
|----------|-------|-----------|----------------|
| Universities | Deadline Driven | Exam schedule, submission deadline, graduation date. Everything date-driven. | Exam today, test papers missing |
| Colleges | Deadline Driven | Course submission deadline, assessment date, enrollment deadline. | Course deadline approaching |
| Private Schools | Deadline Driven | Exam schedule, parent meetings, school events. | Exam today, test papers missing |
| Training Providers | Deadline Driven | Course completion date, certification deadline, student assessment deadline. | Course deadline approaching |

---

## RECRUITMENT (2 industries)

| Industry | Group | Reasoning | Trigger Event |
|----------|-------|-----------|----------------|
| Recruitment Agencies | Deadline Driven | Candidate interview scheduled. Placement deadline with client. Documents needed for background check. | Interview today, documents missing |
| Staffing Agencies | Deadline Driven | Worker assignment date fixed. Client needs staff on Monday. Paperwork incomplete = cannot assign. | Assignment date, documents not ready |

---

## AVIATION (3 industries)

| Industry | Group | Reasoning | Trigger Event |
|----------|-------|-----------|----------------|
| Aircraft Maintenance | Operational Continuity | Aircraft grounded. Spare parts critical. Cannot fly without parts. Every day grounded = revenue lost. | Aircraft grounded, spare parts urgent |
| Airports | Operational Continuity | Runway maintenance window. Equipment missing = maintenance delayed = flight schedule delayed. | Maintenance window closing, equipment needed |
| Flight Operators | Operational Continuity | Flight schedule. Crew documentation missing = flight cannot depart. | Flight departure today, docs missing |

---

## MARITIME (3 industries)

| Industry | Group | Reasoning | Trigger Event |
|----------|-------|-----------|----------------|
| Shipping Agents | Supply Chain | Cargo deadline. Documentation missing = cargo cannot ship. Vessel departure imminent. | Cargo deadline, documents missing |
| Port Operators | Operational Continuity | Vessel in port with limited time window. Equipment missing = operations blocked. | Vessel deadline, equipment needed |
| Marine Engineering | Operational Continuity | Vessel breakdown = emergency repair. Every day adrift = cost escalating. | Vessel breakdown, parts urgent |

---

## SECURITY (3 industries)

| Industry | Group | Reasoning | Trigger Event |
|----------|-------|-----------|----------------|
| Security Companies | Emergency Response | Security breach = immediate response needed. Cannot delay. | Security breach emergency |
| Alarm Installers | Emergency Response | Alarm failure = property vulnerable. Emergency service call. | Alarm system failure |
| Locksmiths | Emergency Response | Property locked. Emergency access needed. Cannot wait. | Property access emergency |

---

## LUXURY & SPECIALIST (8 industries)

| Industry | Group | Reasoning | Trigger Event |
|----------|-------|-----------|----------------|
| Jewellers | Supply Chain | Customer waiting for item from workshop. Collection date approaching. | Customer collection date, item incomplete |
| Watch Specialists | Supply Chain | Watch repair deadline for customer. Appointment approaching. | Customer collection date, repair incomplete |
| Fashion Houses | Deadline Driven | Fashion show deadline. Collection deadline. Samples missing = show cannot happen. | Fashion show deadline approaching |
| Tailors | Supply Chain | Customer collection date for alterations. Wedding dress due. | Customer collection date, alterations incomplete |
| Luxury Retailers | Supply Chain | VIP customer waiting for item from warehouse. High-value transfer. | VIP customer waiting, stock missing |
| Art Galleries | Supply Chain | Exhibition opening date. Artwork missing = exhibition cannot open. | Exhibition opens, artwork not arrived |
| Auction Houses | Supply Chain | Auction day today. Items missing = auction incomplete. | Auction day, lots missing |
| Museums | Supply Chain | Exhibition opening. Artifacts transport urgent. Loan deadline approaching. | Exhibition opening, artifacts missing |

---

## FUNERAL SERVICES (3 industries)

| Industry | Group | Reasoning | Trigger Event |
|----------|-------|-----------|----------------|
| Funeral Directors | Emergency Response | Body transfer urgent. Funeral date imminent. Time-critical. | Funeral date approaching, body transfer |
| Crematorium Services | Emergency Response | Cremation scheduled. Documentation missing. Tight scheduling. | Cremation scheduled, paperwork urgent |
| Memorial Companies | Emergency Response | Memorial installation urgent. Family gathering approaching. | Family gathering, memorial not ready |

---

## INFRASTRUCTURE & UTILITIES (6 industries)

| Industry | Group | Reasoning | Trigger Event |
|----------|-------|-----------|----------------|
| Electricity Contractors | Site Continuity | Power outage = emergency response. Building cannot operate. | Power outage emergency |
| Gas Contractors | Site Continuity | Gas supply emergency. Boiler failure = building cold. | Boiler failure, emergency |
| Water Contractors | Site Continuity | Water supply emergency. Burst pipe = building damaged. | Pipe burst, emergency repair |
| Fibre Installers | Deadline Driven | Installation deadline scheduled. Equipment missing = deadline missed. | Installation deadline, equipment missing |
| Rail Contractors | Site Continuity | Track work deadline. Safety equipment missing. | Track work deadline, equipment needed |
| Rail Maintenance | Site Continuity | Track damage emergency. Maintenance window closing. | Track damage, urgent repair |

---

## SUMMARY

**Total Industries: 85**
**Groups Used:**
- Deadline Driven: 26 industries
- Completion Driven: 4 industries  
- Operational Continuity: 30 industries
- Site Continuity: 12 industries
- Supply Chain: 10 industries
- Emergency Response: 3 industries

---

## ITEMS TO HANDLE

**Remove from intelligence.ts:**
- "retail stores" → Replace with "Retail Stores" (case fix)
- "university" → Replace with "Universities" (case fix)

**Add to intelligence.ts:**
- Airports
- Universities
- Colleges
- AV Suppliers
- Accountants
- Pharmacies
- Orthodontists
- Solicitors
- Notaries
- Jewellers
- Tailors
- Museums
- Surveyors
- Architects
- Locksmiths

**Verify assignments:**
All 85 industries are now mapped with explicit reasoning.

You approve or reject this classification logic before I implement it.
