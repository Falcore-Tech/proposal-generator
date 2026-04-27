-- Insert initial ToS templates from existing hardcoded terms

-- Standard Full Payment ToS
INSERT INTO tos_templates (name, description, payment_type, terms, created_by)
VALUES (
  'Standard Full Payment',
  'Standard terms requiring 100% upfront payment',
  'full',
  '[
    {"id": 1, "title": "Payment Terms", "content": "100% payment required upfront to initiate the project.", "order": 1},
    {"id": 2, "title": "Revisions", "content": "Package includes up to 3 rounds of revisions for each deliverable.", "order": 2},
    {"id": 3, "title": "Timeline", "content": "Estimated completion time is 4-6 weeks from project start date, dependent on client feedback turnaround times.", "order": 3},
    {"id": 4, "title": "Content", "content": "Client is responsible for providing necessary content (brand asset, product information, account credentials etc.) within 3 days of project start.", "order": 4},
    {"id": 5, "title": "Intellectual Property", "content": "Upon full payment, client receives full rights to all deliverables created specifically for this project.", "order": 5},
    {"id": 6, "title": "Cancellation and Satisfaction Guarantee", "content": "We offer a satisfaction guarantee for up to one month after campaign launch. If dissatisfied, client may request a refund with two options:\\n- **Option A**: Full refund of the entire package amount, but must return all deliverables including CRM system access\\n- **Option B**: Partial refund (total package amount minus AED 5,000), and retain permanent access to the CRM system for one year\\n\\nAfter the refund period, clients forfeit content ownership rights and may no longer use the content for advertising or posting, unless they chose Option B to retain CRM access.", "order": 6},
    {"id": 7, "title": "Confidentiality", "content": "XMA Agency agrees to maintain confidentiality of all client information.", "order": 7},
    {"id": 8, "title": "Additional Services", "content": "Any services not specified in this proposal will require a separate agreement.", "order": 8},
    {"id": 9, "title": "Commencement of Ad Management", "content": "The initial ad management period (1 month) will begin once all essential assets—including CRM access, video creatives, and static visuals—have been delivered and approved. Ongoing management beyond this period will require enrollment in one of XMA Agency''s subscription packages.", "order": 9},
    {"id": 10, "title": "Advertising Platforms", "content": "XMA Agency can manage advertising across any major platform. Platform selection is based on the client''s budget and marketing strategy, with common starting points being Google Ads and Meta platforms.", "order": 10},
    {"id": 11, "title": "Ad Spend Handling", "content": "Ad budgets will be actively managed by XMA Agency. However, all payments for ad spend will be made directly by the client through their own advertising account(s).", "order": 11},
    {"id": 12, "title": "CRM Usage and Annual Renewal", "content": "AED 5,000 of this package is allocated to one year of CRM system access. After the initial year, clients must renew their CRM subscription at AED 5,000 per year to maintain access. If clients discontinue marketing services with XMA Agency, they may continue using the CRM system independently by paying the annual renewal fee of AED 5,000.", "order": 12},
    {"id": 13, "title": "Ownership of Data and Assets", "content": "All CRM data, leads, and creative assets produced for the client remain the exclusive property of the client. Upon request, a Non-Disclosure Agreement (NDA) may be signed. In the case of a full refund under our satisfaction guarantee (Option A), ownership of all deliverables reverts to XMA Agency and use of such content is no longer permitted. If client chooses partial refund (Option B), they retain CRM access and data ownership for the paid year.", "order": 13},
    {"id": 14, "title": "Optimization Commitment", "content": "Campaigns managed during the initial period will be actively optimized for performance, with the goal of delivering meaningful results and building a strong foundation for long-term collaboration.", "order": 14},
    {"id": 15, "title": "Delivery of Assets and Reports", "content": "All final assets and reports will be shared with the client upon completion and internal approval, ensuring transparency and full access.", "order": 15},
    {"id": 16, "title": "Support Response Time", "content": "XMA Agency provides customer support within 12–24 hours on business days, with most queries addressed much sooner.", "order": 16},
    {"id": 17, "title": "Reporting & Review Rights", "content": "Clients under ongoing management plans are entitled to request weekly performance reports or biweekly review meetings with their assigned account manager.", "order": 17},
    {"id": 18, "title": "Ad Account Access and Control", "content": "Advertising accounts will be created and owned by the client. XMA Agency will be granted access as an employee or partner for campaign management purposes only.", "order": 18},
    {"id": 19, "title": "Creative Revisions", "content": "All ad creatives will be uniquely tailored to the client''s brand and may undergo revisions until satisfactory, within reasonable limits as defined in the package.", "order": 19},
    {"id": 20, "title": "Project Handover and Exit Support", "content": "If a client chooses not to continue with XMA''s services post-project, a full handover will be provided, along with two weeks of standby support to assist with the transition.", "order": 20},
    {"id": 21, "title": "Package Allocation and CRM Subscription", "content": "This package includes AED 5,000 allocated specifically for one year of CRM system access. The remaining amount covers marketing services, creative assets, and campaign management. Clients receive full CRM access for 12 months from project completion, after which annual renewal at AED 5,000 is required to maintain access.", "order": 21}
  ]'::JSONB,
  (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1)
);

-- Split Payment (50/50) ToS
INSERT INTO tos_templates (name, description, payment_type, terms, created_by)
VALUES (
  'Split Payment 50/50',
  'Terms for 50% upfront and 50% on delivery payment structure',
  'split',
  '[
    {"id": 1, "title": "Payment Terms", "content": "50% payment required upfront to initiate the project. Remaining 50% payment due as specified in the notes section of this proposal. Project delivery will be completed upon receipt of final payment.", "order": 1},
    {"id": 2, "title": "Revisions", "content": "Package includes up to 3 rounds of revisions for each deliverable.", "order": 2},
    {"id": 3, "title": "Timeline", "content": "Estimated completion time is 4-6 weeks from project start date, dependent on client feedback turnaround times.", "order": 3},
    {"id": 4, "title": "Content", "content": "Client is responsible for providing necessary content (brand asset, product information, account credentials etc.) within 3 days of project start.", "order": 4},
    {"id": 5, "title": "Intellectual Property", "content": "Upon full payment completion, client receives full rights to all deliverables created specifically for this project.", "order": 5},
    {"id": 6, "title": "Cancellation and Satisfaction Guarantee", "content": "We offer a satisfaction guarantee for up to one month after campaign launch. If dissatisfied, client may request a refund with two options:\\n- **Option A**: Full refund of the entire package amount, but must return all deliverables including CRM system access\\n- **Option B**: Partial refund (total package amount minus AED 5,000), and retain permanent access to the CRM system for one year\\n\\nAfter the refund period, clients forfeit content ownership rights and may no longer use the content for advertising or posting, unless they chose Option B to retain CRM access.", "order": 6},
    {"id": 7, "title": "Confidentiality", "content": "XMA Agency agrees to maintain confidentiality of all client information.", "order": 7},
    {"id": 8, "title": "Additional Services", "content": "Any services not specified in this proposal will require a separate agreement.", "order": 8},
    {"id": 9, "title": "Project Handover and Exit Support", "content": "If a client chooses not to continue with XMA''s services post-project, a full handover will be provided, along with two weeks of standby support to assist with the transition.", "order": 9},
    {"id": 10, "title": "Late Payment Terms", "content": "The initial ad management period (1 month) will begin once all essential assets—including CRM access, video creatives, and static visuals—have been delivered and approved. Ongoing management beyond this period will require enrollment in one of XMA Agency''s subscription packages.", "order": 10},
    {"id": 11, "title": "Advertising Platforms", "content": "XMA Agency can manage advertising across any major platform. Platform selection is based on the client''s budget and marketing strategy, with common starting points being Google Ads and Meta platforms.", "order": 11},
    {"id": 12, "title": "Ad Spend Handling", "content": "Ad budgets will be actively managed by XMA Agency. However, all payments for ad spend will be made directly by the client through their own advertising account(s).", "order": 12},
    {"id": 13, "title": "CRM Usage and Annual Renewal", "content": "AED 5,000 of this package is allocated to one year of CRM system access. After the initial year, clients must renew their CRM subscription at AED 5,000 per year to maintain access. If clients discontinue marketing services with XMA Agency, they may continue using the CRM system independently by paying the annual renewal fee of AED 5,000.", "order": 13},
    {"id": 14, "title": "Ownership of Data and Assets", "content": "All CRM data, leads, and creative assets produced for the client remain the exclusive property of the client. Upon request, a Non-Disclosure Agreement (NDA) may be signed. In the case of a full refund under our satisfaction guarantee (Option A), ownership of all deliverables reverts to XMA Agency and use of such content is no longer permitted. If client chooses partial refund (Option B), they retain CRM access and data ownership for the paid year.", "order": 14},
    {"id": 15, "title": "Optimization Commitment", "content": "Campaigns managed during the initial period will be actively optimized for performance, with the goal of delivering meaningful results and building a strong foundation for long-term collaboration.", "order": 15},
    {"id": 16, "title": "Delivery of Assets and Reports", "content": "All final assets and reports will be shared with the client upon completion and internal approval, ensuring transparency and full access.", "order": 16},
    {"id": 17, "title": "Support Response Time", "content": "XMA Agency provides customer support within 12–24 hours on business days, with most queries addressed much sooner.", "order": 17},
    {"id": 18, "title": "Reporting & Review Rights", "content": "Clients under ongoing management plans are entitled to request weekly performance reports or biweekly review meetings with their assigned account manager.", "order": 18},
    {"id": 19, "title": "Ad Account Access and Control", "content": "Advertising accounts will be created and owned by the client. XMA Agency will be granted access as an employee or partner for campaign management purposes only.", "order": 19},
    {"id": 20, "title": "Creative Revisions", "content": "All ad creatives will be uniquely tailored to the client''s brand and may undergo revisions until satisfactory, within reasonable limits as defined in the package.", "order": 20},
    {"id": 21, "title": "Payment Schedule and Project Delivery", "content": "Project will commence upon receipt of the first payment (50%). Final deliverables and complete project handover will be provided upon receipt of the remaining 50% payment as scheduled in the proposal notes section. Partial access for review and feedback may be provided before final payment.", "order": 21},
    {"id": 22, "title": "Package Allocation and CRM Subscription", "content": "This package includes AED 5,000 allocated specifically for one year of CRM system access. The remaining amount covers marketing services, creative assets, and campaign management. Clients receive full CRM access for 12 months from project completion, after which annual renewal at AED 5,000 is required to maintain access.", "order": 22}
  ]'::JSONB,
  (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1)
);

-- CRM System Package ToS
INSERT INTO tos_templates (name, description, payment_type, terms, created_by)
VALUES (
  'CRM System Package',
  'Terms for standalone CRM system setup and implementation',
  'full',
  '[
    {"id": 1, "title": "Payment Terms", "content": "100% payment required upfront to initiate the CRM system setup and implementation.", "order": 1},
    {"id": 2, "title": "Timeline", "content": "Maximum completion time for CRM setup and implementation is 2 weeks from project start date, dependent on client feedback and data migration requirements.", "order": 2},
    {"id": 3, "title": "Content and Data Provision", "content": "Client is responsible for providing necessary content (brand assets, existing customer data for migration, user requirements, etc.) within 3 days of project start.", "order": 3},
    {"id": 4, "title": "Data Migration", "content": "XMA Agency will assist with complete data migration from existing systems at no additional cost during the setup period. Client must provide data in compatible formats (CSV, Excel, or direct database access).", "order": 4},
    {"id": 5, "title": "Setup Consultations and User Training", "content": "Package includes 2 comprehensive setup meetings where XMA Agency will work directly with the client to configure all necessary workflows, fields, and system requirements. Additionally, clients receive access to comprehensive training videos covering all CRM functionality. All setup consultation and training is included at no additional cost during the 2-week implementation period.", "order": 5},
    {"id": 6, "title": "System Access and Hosting", "content": "CRM system is hosted on secure cloud servers with 99.9% uptime guarantee. Client receives full administrative access to their CRM instance upon completion of setup.", "order": 6},
    {"id": 7, "title": "Data Ownership and Security", "content": "All CRM data, customer information, and business data remain the exclusive property of the client. XMA Agency implements industry-standard security measures to protect client data.", "order": 7},
    {"id": 8, "title": "Annual Subscription", "content": "After the initial setup, ongoing CRM access requires an annual subscription fee of AED 5,000 per year (excluding VAT). This includes:\\n- Unlimited system access and usage\\n- Cloud hosting and data backup\\n- 24/7 technical support\\n- Regular security updates and system maintenance\\n- All feature updates and enhancements", "order": 8},
    {"id": 9, "title": "Customization and Revisions", "content": "Package includes up to 3 rounds of customization for workflows, fields, and reporting dashboards during the initial setup period.", "order": 9},
    {"id": 10, "title": "Integration Services", "content": "All necessary integrations with email platforms, business tools, and standard software are included at no additional cost during the 2-week setup period. XMA Agency will configure all required integrations based on client needs.", "order": 10},
    {"id": 11, "title": "Backup and Data Recovery", "content": "Automated daily backups are included with the service. Client data is backed up to secure offsite locations with 30-day retention policy.", "order": 11},
    {"id": 12, "title": "System Updates and Maintenance", "content": "Regular system updates, security patches, and feature enhancements are included in the annual subscription at no additional cost.", "order": 12},
    {"id": 13, "title": "User Management", "content": "Client has full control over user access, permissions, and role assignments. Additional user accounts beyond the unlimited users included can be created at any time.", "order": 13},
    {"id": 14, "title": "Confidentiality", "content": "XMA Agency agrees to maintain strict confidentiality of all client data and business information in accordance with industry best practices and data protection regulations.", "order": 14},
    {"id": 15, "title": "Technical Support", "content": "24/7 technical support is provided after the initial setup period. During the 2-week setup phase, dedicated support is available during business hours (9 AM - 6 PM GST) with priority response times.", "order": 15},
    {"id": 16, "title": "Service Level Agreement", "content": "- 99.9% system uptime guarantee\\n- Maximum 4-hour response time for critical issues\\n- Scheduled maintenance notifications 48 hours in advance", "order": 16},
    {"id": 17, "title": "Termination and Data Export", "content": "Client may terminate the service with 30 days written notice. Upon termination, client will receive a complete data export in standard formats (CSV, Excel). Data will be retained for 30 days post-termination for recovery purposes.", "order": 17},
    {"id": 18, "title": "Intellectual Property", "content": "Upon full payment, client receives full usage rights to their customized CRM system. XMA Agency retains rights to the underlying software platform and general features.", "order": 18},
    {"id": 19, "title": "Limitation of Liability", "content": "XMA Agency''s liability is limited to the amount paid for the CRM system package. We are not liable for any indirect, consequential, or business losses.", "order": 19},
    {"id": 20, "title": "Setup Period - All Services Included", "content": "During the 2-week setup period, all labor, consultations, integrations, customizations, and training are included at no additional cost. This includes unlimited revisions and modifications to ensure the CRM system meets all client requirements.", "order": 20},
    {"id": 21, "title": "Validity", "content": "This proposal is valid for 30 days from the date issued.", "order": 21},
    {"id": 22, "title": "14-Day Money Back Guarantee", "content": "If client is not satisfied with the CRM system within 14 days of completion, a full refund will be provided. Client must provide written notice of dissatisfaction and specific reasons for the refund request.", "order": 22}
  ]'::JSONB,
  (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1)
);

-- Note: This migration assumes admin users already exist in the profiles table