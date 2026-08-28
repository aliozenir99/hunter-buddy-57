
CREATE OR REPLACE FUNCTION public.set_updated_at() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql SET search_path = public;

-- profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY,
  display_name TEXT,
  role_title TEXT DEFAULT 'B2B Sales Hunter',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own profile" ON public.profiles FOR ALL TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE TRIGGER t_profiles_upd BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email,'@',1)))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END; $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- account managers
CREATE TABLE public.account_managers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  department TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.account_managers TO authenticated;
GRANT ALL ON public.account_managers TO service_role;
ALTER TABLE public.account_managers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "workspace am" ON public.account_managers FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER t_am_upd BEFORE UPDATE ON public.account_managers FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- companies
CREATE TABLE public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  industry TEXT,
  company_type TEXT,
  website TEXT,
  address TEXT,
  city TEXT,
  country TEXT,
  status TEXT NOT NULL DEFAULT 'Lead',
  lead_source TEXT,
  priority TEXT NOT NULL DEFAULT 'Medium',
  potential_value NUMERIC DEFAULT 0,
  account_manager_id UUID REFERENCES public.account_managers(id) ON DELETE SET NULL,
  relationship_strength TEXT DEFAULT 'Cold',
  business_potential TEXT DEFAULT 'Medium',
  engagement TEXT DEFAULT 'Low',
  interests TEXT[] DEFAULT '{}',
  important_notes TEXT,
  next_action TEXT,
  last_contact_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.companies TO authenticated;
GRANT ALL ON public.companies TO service_role;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "workspace companies" ON public.companies FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER t_companies_upd BEFORE UPDATE ON public.companies FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- contacts
CREATE TABLE public.contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  position TEXT,
  phone TEXT,
  email TEXT,
  telegram TEXT,
  whatsapp TEXT,
  is_decision_maker BOOLEAN NOT NULL DEFAULT false,
  is_influencer BOOLEAN NOT NULL DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.contacts TO authenticated;
GRANT ALL ON public.contacts TO service_role;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "workspace contacts" ON public.contacts FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER t_contacts_upd BEFORE UPDATE ON public.contacts FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- meetings
CREATE TABLE public.meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES public.contacts(id) ON DELETE SET NULL,
  meeting_date DATE NOT NULL,
  meeting_time TIME,
  location TEXT,
  meeting_type TEXT NOT NULL DEFAULT 'Office Visit',
  purpose TEXT,
  preparation_notes TEXT,
  discussion TEXT,
  client_needs TEXT,
  requests TEXT,
  pain_points TEXT,
  objections TEXT,
  opportunities TEXT,
  competitors TEXT,
  decision_maker TEXT,
  budget TEXT,
  timeline TEXT,
  next_steps TEXT,
  personal_notes TEXT,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.meetings TO authenticated;
GRANT ALL ON public.meetings TO service_role;
ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "workspace meetings" ON public.meetings FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER t_meetings_upd BEFORE UPDATE ON public.meetings FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- requests
CREATE TABLE public.requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES public.contacts(id) ON DELETE SET NULL,
  meeting_id UUID REFERENCES public.meetings(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  request_type TEXT DEFAULT 'Accommodation',
  request_date DATE NOT NULL DEFAULT CURRENT_DATE,
  details TEXT,
  check_in DATE,
  check_out DATE,
  rooms INTEGER,
  room_type TEXT,
  guests INTEGER,
  event_date DATE,
  conference_room TEXT,
  fnb TEXT,
  special_requirements TEXT,
  budget TEXT,
  deadline DATE,
  status TEXT NOT NULL DEFAULT 'New',
  account_manager_id UUID REFERENCES public.account_managers(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.requests TO authenticated;
GRANT ALL ON public.requests TO service_role;
ALTER TABLE public.requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "workspace requests" ON public.requests FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER t_requests_upd BEFORE UPDATE ON public.requests FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- opportunities
CREATE TABLE public.opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES public.contacts(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  potential_business TEXT,
  estimated_value NUMERIC DEFAULT 0,
  probability INTEGER DEFAULT 20,
  expected_decision_date DATE,
  source TEXT,
  stage TEXT NOT NULL DEFAULT 'Target Identified',
  next_action TEXT,
  notes TEXT,
  account_manager_id UUID REFERENCES public.account_managers(id) ON DELETE SET NULL,
  handover_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.opportunities TO authenticated;
GRANT ALL ON public.opportunities TO service_role;
ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "workspace opps" ON public.opportunities FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER t_opps_upd BEFORE UPDATE ON public.opportunities FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- follow ups
CREATE TABLE public.follow_ups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  meeting_id UUID REFERENCES public.meetings(id) ON DELETE SET NULL,
  opportunity_id UUID REFERENCES public.opportunities(id) ON DELETE SET NULL,
  task TEXT NOT NULL,
  due_date DATE NOT NULL DEFAULT CURRENT_DATE,
  priority TEXT NOT NULL DEFAULT 'Medium',
  responsible TEXT DEFAULT 'Ali',
  status TEXT NOT NULL DEFAULT 'Pending',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.follow_ups TO authenticated;
GRANT ALL ON public.follow_ups TO service_role;
ALTER TABLE public.follow_ups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "workspace fu" ON public.follow_ups FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER t_fu_upd BEFORE UPDATE ON public.follow_ups FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- activities
CREATE TABLE public.activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES public.contacts(id) ON DELETE SET NULL,
  meeting_id UUID REFERENCES public.meetings(id) ON DELETE SET NULL,
  activity_type TEXT NOT NULL DEFAULT 'Call',
  subject TEXT NOT NULL,
  summary TEXT,
  activity_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  duration_minutes INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.activities TO authenticated;
GRANT ALL ON public.activities TO service_role;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "workspace act" ON public.activities FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER t_act_upd BEFORE UPDATE ON public.activities FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- email drafts
CREATE TABLE public.email_drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  request_id UUID REFERENCES public.requests(id) ON DELETE SET NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  language TEXT DEFAULT 'English',
  tone TEXT DEFAULT 'Professional',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.email_drafts TO authenticated;
GRANT ALL ON public.email_drafts TO service_role;
ALTER TABLE public.email_drafts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "workspace mail" ON public.email_drafts FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER t_mail_upd BEFORE UPDATE ON public.email_drafts FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- handovers
CREATE TABLE public.handovers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  opportunity_id UUID REFERENCES public.opportunities(id) ON DELETE SET NULL,
  account_manager_id UUID REFERENCES public.account_managers(id) ON DELETE SET NULL,
  client_summary TEXT,
  relationship TEXT,
  business_need TEXT,
  opportunity_summary TEXT,
  requirements TEXT,
  budget TEXT,
  decision_maker TEXT,
  timeline TEXT,
  competitors TEXT,
  concerns TEXT,
  recommended_approach TEXT,
  previous_communication TEXT,
  status TEXT NOT NULL DEFAULT 'Draft',
  handover_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.handovers TO authenticated;
GRANT ALL ON public.handovers TO service_role;
ALTER TABLE public.handovers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "workspace handovers" ON public.handovers FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER t_handovers_upd BEFORE UPDATE ON public.handovers FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ DEMO DATA ============
INSERT INTO public.account_managers (id, name, email, department) VALUES
 ('a1111111-1111-4111-8111-111111111111','Aigul Sadykova','aigul@hotel.kg','Corporate Sales'),
 ('a2222222-2222-4222-8222-222222222222','Timur Osmonov','timur@hotel.kg','MICE & Events'),
 ('a3333333-3333-4333-8333-333333333333','Elena Kim','elena@hotel.kg','Leisure & Travel Trade');

INSERT INTO public.companies (id,name,industry,company_type,website,address,city,country,status,lead_source,priority,potential_value,account_manager_id,relationship_strength,business_potential,engagement,interests,important_notes,next_action,last_contact_at) VALUES
 ('c1111111-1111-4111-8111-111111111111','ABC Travel Group','Travel & Tourism','Travel Agency','abctravel.kg','12 Chuy Ave','Bishkek','Kyrgyzstan','Qualified Opportunity','Referral','High',86000,'a3333333-3333-4333-8333-333333333333','Active','High','High','{"Corporate accommodation","Business travel","Long stay"}','Prefers WhatsApp. Always compares with Hyatt pricing.','Send Corporate 4 proposal', now() - interval '1 day'),
 ('c2222222-2222-4222-8222-222222222222','KICB Bank','Banking & Finance','Corporate','kicb.net','21 Erkindik Blvd','Bishkek','Kyrgyzstan','Active Client','Cold Outreach','High',124000,'a1111111-1111-4111-8111-111111111111','Strong','High','High','{"Conferences","Meetings","F&B"}','Annual convention every November. Procurement is formal — always needs written offers.','Confirm November convention block', now() - interval '3 day'),
 ('c3333333-3333-4333-8333-333333333333','TechNova Solutions','IT & Software','SME','technova.io','7 Ibraimova St','Bishkek','Kyrgyzstan','Lead','LinkedIn','Medium',38000,NULL,'Warm','Medium','Medium','{"Corporate accommodation","Meetings"}','Growing fast — 4 new offices planned. Budget conscious.','Book discovery meeting', now() - interval '9 day'),
 ('c4444444-4444-4444-8444-444444444444','Global Air Crew Services','Aviation','Corporate','globalaircrew.com','Manas Airport Rd','Bishkek','Kyrgyzstan','Engaged','Event','High',210000,'a1111111-1111-4111-8111-111111111111','Warm','High','Medium','{"Long stay","Corporate accommodation","F&B"}','Crew layover contract — 24/7 check-in flexibility is mandatory.','Prepare crew rate sheet', now() - interval '5 day'),
 ('c5555555-5555-4555-8555-555555555555','Silk Road Logistics','Logistics','SME','silkroadlog.kg','44 Jibek Jolu','Bishkek','Kyrgyzstan','Cold','Cold Outreach','Low',15000,NULL,'Cold','Low','Low','{"Business travel"}','No response for 3 weeks. Try new contact.','Re-engage with new contact', now() - interval '23 day'),
 ('c6666666-6666-4666-8666-666666666666','Ministry of Digital Development','Government','Government','digital.gov.kg','58 Kievskaya St','Bishkek','Kyrgyzstan','Engaged','Business Networking','Medium',64000,'a2222222-2222-4222-8222-222222222222','Warm','Medium','Medium','{"Conferences","Events","F&B"}','Tender-based procurement. Needs invoices in KGS.','Send conference package', now() - interval '6 day');

INSERT INTO public.contacts (id,company_id,full_name,position,phone,email,telegram,whatsapp,is_decision_maker,is_influencer,notes) VALUES
 ('b1111111-1111-4111-8111-111111111111','c1111111-1111-4111-8111-111111111111','Nurlan Abdyldaev','Head of Corporate Travel','+996 555 112233','nurlan@abctravel.kg','@nurlan_a','+996555112233',true,false,'Direct, decisive. Responds fastest on WhatsApp in the evening.'),
 ('b1111112-1111-4111-8111-111111111112','c1111111-1111-4111-8111-111111111111','Aida Toktogulova','Operations Manager','+996 555 998877','aida@abctravel.kg',NULL,NULL,false,true,'Handles day-to-day bookings.'),
 ('b2222221-2222-4222-8222-222222222221','c2222222-2222-4222-8222-222222222222','Sanjar Isakov','Head of Administration','+996 700 445566','sanjar@kicb.net','@sanjar_i',NULL,true,false,'Owns the events budget.'),
 ('b2222222-2222-4222-8222-222222222222','c2222222-2222-4222-8222-222222222222','Cholpon Mamatova','Procurement Specialist','+996 700 223344','cholpon@kicb.net',NULL,NULL,false,true,'Requires 3 competing offers for every purchase.'),
 ('b3333333-3333-4333-8333-333333333333','c3333333-3333-4333-8333-333333333333','Adilet Jumaev','COO','+996 550 667788','adilet@technova.io','@adilet_j',NULL,true,false,'Ex-consultant, very analytical.'),
 ('b4444444-4444-4444-8444-444444444444','c4444444-4444-4444-8444-444444444444','Marta Kowalska','Crew Logistics Director','+48 601 334455','marta@globalaircrew.com',NULL,'+48601334455',true,false,'Based in Warsaw, visits quarterly.'),
 ('b5555555-5555-4555-8555-555555555555','c5555555-5555-4555-8555-555555555555','Ruslan Bekturov','Office Manager','+996 312 556677','ruslan@silkroadlog.kg',NULL,NULL,false,false,'Gatekeeper. Rarely replies.'),
 ('b6666666-6666-4666-8666-666666666666','c6666666-6666-4666-8666-666666666666','Gulnara Asanova','Events Coordinator','+996 312 887766','gulnara@digital.gov.kg',NULL,NULL,false,true,'Coordinates the annual digital summit.');

INSERT INTO public.meetings (id,company_id,contact_id,meeting_date,meeting_time,location,meeting_type,purpose,preparation_notes,discussion,client_needs,requests,pain_points,objections,opportunities,competitors,decision_maker,budget,timeline,next_steps,personal_notes,is_completed) VALUES
 ('d1111111-1111-4111-8111-111111111111','c1111111-1111-4111-8111-111111111111','b1111111-1111-4111-8111-111111111111',CURRENT_DATE - 1,'11:00','ABC Travel office','Client Visit','Discuss corporate agreement','Bring Corporate 4 rate card','Nurlan confirmed they place 30-40 corporate room nights monthly, currently split between Hyatt and Novotel. Interested in consolidating with a single hotel if cancellation terms are flexible.','Corporate accommodation for 30-40 guests per month with flexible cancellation.','Send corporate rates, arrange a hotel tour next week.','Rigid cancellation policies cost them money when trips are cancelled last minute.','Worried our rack rate is above Novotel.','Annual corporate agreement worth ~$86k.','Hyatt Regency, Novotel','Nurlan Abdyldaev','Approx. $7k/month','Decision expected within 3 weeks','Send Corporate 4 proposal; arrange hotel tour','Nurlan is ready. Do not over-engineer the offer.',true),
 ('d2222222-2222-4222-8222-222222222222','c2222222-2222-4222-8222-222222222222','b2222221-2222-4222-8222-222222222221',CURRENT_DATE,'10:00','Hotel lobby lounge','Hotel Visit','Annual convention site inspection','Reserve the Ala-Too ballroom for viewing',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,false),
 ('d3333333-3333-4333-8333-333333333333','c4444444-4444-4444-8444-444444444444','b4444444-4444-4444-8444-444444444444',CURRENT_DATE,'14:00','Global Air Crew office','Client Visit','Crew layover contract discussion','Prepare 24/7 check-in workflow summary',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,false),
 ('d4444444-4444-4444-8444-444444444444','c6666666-6666-4666-8666-666666666666','b6666666-6666-4666-8666-666666666666',CURRENT_DATE + 2,'15:30','Ministry office','Office Visit','Digital summit venue requirements',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,false),
 ('d5555555-5555-4555-8555-555555555555','c3333333-3333-4333-8333-333333333333','b3333333-3333-4333-8333-333333333333',CURRENT_DATE - 9,'16:00','Online (Zoom)','Online Meeting','Discovery call',NULL,'Adilet described 4 new office openings and frequent visits by engineers from Almaty and Tashkent.','Regular short stays for visiting engineers, 8-12 nights monthly.','Requested a sample rate sheet.','Currently booking ad-hoc via Booking.com, no invoicing consolidation.','Not sure the volume justifies a contract yet.','Consolidated corporate rate agreement.','Booking.com, Orion Hotel','Adilet Jumaev','Unknown','Q4 review','Send sample rate sheet and follow up in 2 weeks','Analytical - send numbers not marketing.',true),
 ('d6666666-6666-4666-8666-666666666666','c2222222-2222-4222-8222-222222222222','b2222221-2222-4222-8222-222222222221',CURRENT_DATE - 3,'12:00','KICB head office','Client Visit','Convention scoping','Bring MICE brochure','Sanjar outlined the November convention: 2 days, 120 delegates, 40 room nights, full catering.','Conference space for 120 delegates plus 40 rooms and full F&B.','Requested a full MICE proposal including coffee breaks and gala dinner.','Last year the AV setup at another venue failed.','Budget approval requires procurement sign-off.','November convention worth ~$124k.','Sheraton Bishkek','Sanjar Isakov','Approx. $124k','Decision by end of September','Send MICE proposal to AM; confirm ballroom availability','Sanjar hinted Sheraton was cheaper but AV was poor.',true);

INSERT INTO public.requests (id,company_id,contact_id,meeting_id,title,request_type,request_date,details,check_in,check_out,rooms,room_type,guests,event_date,conference_room,fnb,special_requirements,budget,deadline,status,account_manager_id) VALUES
 ('e1111111-1111-4111-8111-111111111111','c2222222-2222-4222-8222-222222222222','b2222221-2222-4222-8222-222222222221','d6666666-6666-4666-8666-666666666666','Annual Convention — 40 rooms + ballroom','Event',CURRENT_DATE - 3,'Two-day annual convention for 120 delegates with accommodation for regional guests.',CURRENT_DATE + 70,CURRENT_DATE + 72,40,'Deluxe Twin',120,CURRENT_DATE + 70,'Ala-Too Ballroom, theatre style, 120 pax','2 coffee breaks daily, lunch, gala dinner','Full AV with backup projector and technician on site','~$124,000',CURRENT_DATE + 5,'Sent to Account Manager','a1111111-1111-4111-8111-111111111111'),
 ('e2222222-2222-4222-8222-222222222222','c1111111-1111-4111-8111-111111111111','b1111111-1111-4111-8111-111111111111','d1111111-1111-4111-8111-111111111111','Corporate rate agreement — 30-40 room nights/month','Corporate Agreement',CURRENT_DATE - 1,'Ongoing corporate accommodation agreement with flexible cancellation up to 24h.',NULL,NULL,35,'Standard King',35,NULL,NULL,'Breakfast included','Flexible cancellation up to 24 hours before arrival','~$7,000/month',CURRENT_DATE + 2,'New',NULL),
 ('e3333333-3333-4333-8333-333333333333','c4444444-4444-4444-8444-444444444444','b4444444-4444-4444-8444-444444444444',NULL,'Crew layover block — 12 rooms rolling','Accommodation',CURRENT_DATE - 5,'Rolling crew block with 24/7 check-in and late checkout.',CURRENT_DATE + 10,CURRENT_DATE + 40,12,'Standard Twin',12,NULL,NULL,'Late night light meals','24/7 check-in, blackout curtains, quiet floor','~$18,000/month',CURRENT_DATE + 7,'Information Needed','a1111111-1111-4111-8111-111111111111'),
 ('e4444444-4444-4444-8444-444444444444','c6666666-6666-4666-8666-666666666666','b6666666-6666-4666-8666-666666666666',NULL,'Digital Summit — conference room for 200','Conference',CURRENT_DATE - 6,'Government digital summit, one day, 200 attendees.',NULL,NULL,0,NULL,200,CURRENT_DATE + 45,'Main hall, 200 pax classroom','Coffee breaks and buffet lunch','Invoicing in KGS, tender documents required','~$40,000',CURRENT_DATE + 12,'Proposal in Progress','a2222222-2222-4222-8222-222222222222');

INSERT INTO public.opportunities (id,company_id,contact_id,name,potential_business,estimated_value,probability,expected_decision_date,source,stage,next_action,notes,account_manager_id,handover_date) VALUES
 ('f1111111-1111-4111-8111-111111111111','c1111111-1111-4111-8111-111111111111','b1111111-1111-4111-8111-111111111111','ABC Travel Corporate Agreement','Annual corporate accommodation agreement',86000,70,CURRENT_DATE + 21,'Referral','Opportunity Qualified','Send Corporate 4 proposal and arrange hotel tour','Client switching from Hyatt/Novotel. Flexible cancellation is the deciding factor.',NULL,NULL),
 ('f2222222-2222-4222-8222-222222222222','c2222222-2222-4222-8222-222222222222','b2222221-2222-4222-8222-222222222221','KICB Annual Convention','2-day convention, 120 delegates, 40 rooms',124000,80,CURRENT_DATE + 30,'Cold Outreach','Assigned to Account Manager','AM to submit MICE proposal','Procurement requires 3 competing offers.','a1111111-1111-4111-8111-111111111111',CURRENT_DATE - 2),
 ('f3333333-3333-4333-8333-333333333333','c4444444-4444-4444-8444-444444444444','b4444444-4444-4444-8444-444444444444','Global Air Crew Layover Contract','Rolling 12-room crew block, 12 months',210000,55,CURRENT_DATE + 40,'Event','Visit / Meeting Held','Confirm 24/7 check-in feasibility with operations','Highest value opportunity in pipeline.',NULL,NULL),
 ('f4444444-4444-4444-8444-444444444444','c6666666-6666-4666-8666-666666666666','b6666666-6666-4666-8666-666666666666','Digital Summit 2026','One-day summit for 200 attendees',64000,45,CURRENT_DATE + 25,'Business Networking','Engaged / Meeting Booked','Attend venue requirements meeting','Tender process — timing is tight.',NULL,NULL),
 ('f5555555-5555-4555-8555-555555555555','c3333333-3333-4333-8333-333333333333','b3333333-3333-4333-8333-333333333333','TechNova Corporate Rate','8-12 room nights monthly',38000,30,CURRENT_DATE + 60,'LinkedIn','First Contact Made','Send sample rate sheet','Needs data-driven justification.',NULL,NULL),
 ('f6666666-6666-4666-8666-666666666666','c5555555-5555-4555-8555-555555555555',NULL,'Silk Road Business Travel','Occasional business travel',15000,10,CURRENT_DATE + 90,'Cold Outreach','Target Identified','Find a new contact on LinkedIn','Gone cold — 23 days no contact.',NULL,NULL);

INSERT INTO public.follow_ups (company_id,meeting_id,opportunity_id,task,due_date,priority,status,notes) VALUES
 ('c1111111-1111-4111-8111-111111111111','d1111111-1111-4111-8111-111111111111','f1111111-1111-4111-8111-111111111111','Call Nurlan regarding corporate rates',CURRENT_DATE - 2,'High','Pending','Confirm flexible cancellation terms before sending the proposal.'),
 ('c1111111-1111-4111-8111-111111111111','d1111111-1111-4111-8111-111111111111','f1111111-1111-4111-8111-111111111111','Send Corporate 4 proposal to ABC Travel',CURRENT_DATE,'High','Pending','Include 24h flexible cancellation clause.'),
 ('c2222222-2222-4222-8222-222222222222','d6666666-6666-4666-8666-666666666666','f2222222-2222-4222-8222-222222222222','Send convention request to Account Manager',CURRENT_DATE,'High','In Progress','40 rooms + ballroom + catering specs.'),
 ('c4444444-4444-4444-8444-444444444444',NULL,'f3333333-3333-4333-8333-333333333333','Confirm 24/7 check-in with front office',CURRENT_DATE + 1,'Medium','Pending',NULL),
 ('c5555555-5555-4555-8555-555555555555',NULL,'f6666666-6666-4666-8666-666666666666','Re-engage Silk Road with a new contact',CURRENT_DATE - 4,'Low','Pending','No reply for 3 weeks.'),
 ('c3333333-3333-4333-8333-333333333333','d5555555-5555-4555-8555-555555555555','f5555555-5555-4555-8555-555555555555','Send sample rate sheet to TechNova',CURRENT_DATE + 3,'Medium','Pending',NULL),
 ('c2222222-2222-4222-8222-222222222222','d6666666-6666-4666-8666-666666666666',NULL,'Confirm ballroom availability for November',CURRENT_DATE - 1,'High','Completed','Ballroom confirmed available.'),
 ('c6666666-6666-4666-8666-666666666666',NULL,'f4444444-4444-4444-8444-444444444444','Prepare summit conference package',CURRENT_DATE + 4,'Medium','Pending',NULL);

INSERT INTO public.activities (company_id,contact_id,meeting_id,activity_type,subject,summary,activity_date,duration_minutes) VALUES
 ('c1111111-1111-4111-8111-111111111111','b1111111-1111-4111-8111-111111111111','d1111111-1111-4111-8111-111111111111','Meeting','Client visit — corporate agreement','Discussed corporate accommodation and flexible cancellation.',now() - interval '1 day',60),
 ('c1111111-1111-4111-8111-111111111111','b1111111-1111-4111-8111-111111111111',NULL,'WhatsApp','Rate card question','Nurlan asked whether breakfast is included.',now() - interval '20 hour',NULL),
 ('c2222222-2222-4222-8222-222222222222','b2222221-2222-4222-8222-222222222221','d6666666-6666-4666-8666-666666666666','Meeting','Convention scoping meeting','Scoped 120-delegate convention.',now() - interval '3 day',75),
 ('c2222222-2222-4222-8222-222222222222','b2222222-2222-4222-8222-222222222222',NULL,'Email','Sent MICE brochure','Shared brochure and draft agenda.',now() - interval '2 day',NULL),
 ('c3333333-3333-4333-8333-333333333333','b3333333-3333-4333-8333-333333333333','d5555555-5555-4555-8555-555555555555','Meeting','Discovery call','Qualified as medium potential.',now() - interval '9 day',35),
 ('c4444444-4444-4444-8444-444444444444','b4444444-4444-4444-8444-444444444444',NULL,'Call','Crew block requirements','Discussed 24/7 check-in and quiet floors.',now() - interval '5 day',22),
 ('c5555555-5555-4555-8555-555555555555','b5555555-5555-4555-8555-555555555555',NULL,'Call','Cold outreach attempt','No answer.',now() - interval '23 day',1),
 ('c6666666-6666-4666-8666-666666666666','b6666666-6666-4666-8666-666666666666',NULL,'Email','Summit requirements','Received tender documentation list.',now() - interval '6 day',NULL),
 ('c4444444-4444-4444-8444-444444444444','b4444444-4444-4444-8444-444444444444',NULL,'Visit','Airport office visit','Met crew logistics team at Manas.',now() - interval '12 day',90),
 ('c1111111-1111-4111-8111-111111111111','b1111112-1111-4111-8111-111111111112',NULL,'Call','Operations follow-up','Aida confirmed booking volumes.',now() - interval '8 day',15);

INSERT INTO public.handovers (company_id,opportunity_id,account_manager_id,client_summary,relationship,business_need,opportunity_summary,requirements,budget,decision_maker,timeline,competitors,concerns,recommended_approach,previous_communication,status,handover_date) VALUES
 ('c2222222-2222-4222-8222-222222222222','f2222222-2222-4222-8222-222222222222','a1111111-1111-4111-8111-111111111111','KICB Bank — Sanjar Isakov, Head of Administration, sanjar@kicb.net','4 interactions over 6 weeks: 1 cold call, 2 meetings, 1 email.','Two-day annual convention for 120 delegates including 40 room nights and full catering.','November convention, estimated $124,000.','Ala-Too ballroom theatre style, 40 deluxe twin rooms, 2 coffee breaks daily, lunch, gala dinner, full AV with backup.','Approx. $124,000','Sanjar Isakov (budget owner), Cholpon Mamatova (procurement)','Decision by end of September','Sheraton Bishkek','AV reliability after a bad experience last year; procurement needs 3 competing offers.','Lead with AV reliability and on-site technician. Provide a formal written offer suitable for procurement comparison.','Convention scoping meeting, MICE brochure email, ballroom availability confirmation.','Completed',CURRENT_DATE - 2);
