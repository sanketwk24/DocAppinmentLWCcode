public without sharing class FetchDoctors {
    @AuraEnabled(cacheable=true)
    public static List<Contact> fetchDoctorsByPain() {
         List<Contact> doctor = new List<Contact>();
   
            WorkTypeCodeSetBundle worktypecsb = [SELECT Id, Name,ParentId, ServiceTypeId FROM WorkTypeCodeSetBundle
                                                 WHERE ServiceType.CodeSet1.Code ='R25.2'];
            system.debug(worktypecsb);
            if(worktypecsb != null){
                WorkTypeCareSpecialty worktypecs = [SELECT Id,Name,WorkTypeId,CareSpecialtyId
                                                    FROM WorkTypeCareSpecialty 
                                                     WHERE WorkTypeId =: worktypecsb.ParentId];
                system.debug(worktypecs);
                
                Set<Id> worktypeId = new Set<Id>();
                if(worktypecs != null){
                 list<CareProviderFacilitySpecialty> carepfs = [SELECT Id, Name, SpecialtyId,PractitionerFacilityId
                                                             FROM CareProviderFacilitySpecialty
                                                             WHERE SpecialtyId =: worktypecs.CareSpecialtyId];
                    for(CareProviderFacilitySpecialty careIds : carepfs){
                        worktypeId.add(careIds.PractitionerFacilityId);
                    }
                     system.debug(carepfs);
                  Set<Id>  healthcareId = New Set<Id>(); 
                 list<HealthcarePractitionerFacility> hCpf = [SELECT Id, Name, PractitionerId 
                                                          FROM HealthcarePractitionerFacility 
                                                          WHERE Id IN : worktypeId];
                    system.debug(hCpf);
                    for(HealthcarePractitionerFacility healthcarePf :hCpf ){
                        healthcareId.add(healthcarePf.PractitionerId);
                    }
                    
                  doctor = [SELECT Id,	Image_URL__c, Name, Awards_and_Regonitions__c, Overview__c,Area_of_Expertise__c,AccountId,
                            Available_Appointment_Type__c, MailingAddress, Account.Name, Account.BillingCity,Account.BillingState,Account.BillingPostalCode,Account.BillingCountry FROM Contact 
                                         WHERE Id IN : healthcareId];
                    
                   system.debug(doctor); 
                    
                }
                else{system.debug('No CareProviderFacilitySpecialty exist');}
            }
           
        
           
            return doctor;
             
        
    }
    @AuraEnabled
    public static List<TimeSlot> getTimeSlots(String contctId,String accntId){
        HealthcarePractitionerFacility createfac=new HealthcarePractitionerFacility();
        List<TimeSlot> getSlots=new List<TimeSlot>();
        if(TimeSlot.SObjectType.getDescribe().isAccessible()&&
        Schema.SObjectType.TimeSlot.fields.Id.isAccessible()&&
        HealthcarePractitionerFacility.SObjectType.getDescribe().isAccessible()&&
        Schema.SObjectType.HealthcarePractitionerFacility.fields.Id.isAccessible())
      {
        if(contctId != null && accntId !=null){
            system.debug('accntId  ' +accntId);
            system.debug('contctId  ' +contctId);
            createfac =[select Id,Name,AccountId,PractitionerId,ServiceTerritoryMember.ServiceTerritory.OperatingHours.TimeZone,ServiceTerritoryMember.ServiceResourceId from HealthcarePractitionerFacility where AccountId=:accntId and PractitionerId=:contctId  ];
            getSlots =[Select DayOfWeek,StartTime,EndTime from TimeSlot where OperatingHoursId=:createfac.ServiceTerritoryMember.ServiceTerritory.OperatingHours.Id  ];
            system.debug('getSlots  ' +getSlots);
        }
       
    }
        return getSlots;
    }
    @AuraEnabled(cacheable=true)
    public static String getAccountIdByContactId(String contactId) {
        system.debug('contactid  ' +contactId);
        Contact contact = [SELECT AccountId FROM Contact WHERE Id = :contactId LIMIT 1];
        system.debug('contact ' +contact);
        return contact.AccountId;
    }
    @AuraEnabled
    public static String insertDummyAttachment(String PatientId) {
       System.debug('PatientId>>'+PatientId);
         String getAttchmentId = '';
        String searchData = 'data';
        List<String> selectedQuestions = new List<String>();
        selectedQuestions.add('Question 1');
         selectedQuestions.add('Question 2');
        
        // Render the VF page as a PDF
        PageReference pdfPage = Page.PatientTriageGenerativeAI; // Change to your VF page name
        pdfPage.getParameters().put('searchData', searchData);
        
        for (Integer i = 0; i < selectedQuestions.size(); i++) {
            pdfPage.getParameters().put('selectedQuestions[' + i + ']', selectedQuestions[i]);
        }
        
        Blob pdfBlob = pdfPage.getContentAsPDF();

        // Insert the PDF as a file in Salesforce
        if (pdfBlob != null) {
            getAttchmentId = insertPdfAsAttachment(pdfBlob, '0014x00001SkvDNAAZ', '0014x00001SkvDNAAZ');
        }

        return getAttchmentId;
    }
    public static String insertPdfAsAttachment(Blob pdfBlob, String fileName, String parentId) {
        Attachment attachment = new Attachment();
        attachment.ParentId = parentId; // ID of the record to attach the PDF to
        attachment.Name = fileName;
        attachment.Body = pdfBlob;
        attachment.ContentType = 'application/pdf';

        insert attachment;
       
        return attachment.Id;
                }
    
    @AuraEnabled 
    public static TimePreview createfacilities(String accntId,String contctId){
        TimePreview timeList =  new  TimePreview();
        if(HealthcarePractitionerFacility.SObjectType.getDescribe().isAccessible()&&
        Schema.SObjectType.HealthcarePractitionerFacility.fields.Id.isAccessible() &&
        ServiceTerritoryWorkType.SObjectType.getDescribe().isAccessible()&&
        Schema.SObjectType.ServiceTerritoryWorkType.fields.Id.isAccessible() &&
        WorkTypeGroupMember.SObjectType.getDescribe().isAccessible()&&
        Schema.SObjectType.WorkTypeGroupMember.fields.Id.isAccessible())
      {
        if(contctId != null && accntId !=null){
            HealthcarePractitionerFacility createfac =[select Id,Name,AccountId,PractitionerId,ServiceTerritoryMember.ServiceTerritory.OperatingHours.TimeZone,ServiceTerritoryMember.ServiceResourceId,ServiceTerritoryMember.ServiceTerritoryId from HealthcarePractitionerFacility where AccountId=:accntId and PractitionerId=:contctId  ];
            system.debug('HPF > ' +createfac);
            ServiceTerritoryWorkType timesl= [SELECT Id, WorkType.Name FROM ServiceTerritoryWorkType WHERE ServiceTerritoryId =: createfac.ServiceTerritoryMember.ServiceTerritoryId  ];
            system.debug('timesl > ' +timesl);
            WorkTypeGroupMember timesls=[SELECT Id, WorkTypeGroup.Name FROM WorkTypeGroupMember WHERE WorkTypeId =: timesl.WorkType.Id  ];
            system.debug('timesls > ' +timesls);
            
            timeList.practitionerfacility=createfac;
            timeList.workTypeName=timesl;
            timeList.workTypeGroupName=timesls;
        }
    }
        return timeList;
    }
    
    public class TimePreview{
        @AuraEnabled
        public  HealthcarePractitionerFacility practitionerfacility;
        
        @AuraEnabled
        public ServiceTerritoryWorkType workTypeName;
        
        @AuraEnabled
        public workTypeGroupMember workTypeGroupName;
        
    }
    @AuraEnabled(cacheable=true)
    public static HealthcareProviderSpecialty fetchSpecialityHospiatalByDoctor(String doctId,String hospId) {
        HealthcareProviderSpecialty getAccountId=new HealthcareProviderSpecialty();
        system.debug(doctId);
        system.debug(hospId);
      if(doctId !=null && hospId!=null){
            getAccountId = [SELECT  Practitioner.Name ,Practitioner.Image_URL__c,Specialty.Name,Account.Name,Practitioner.AccountId,PractitionerId,SpecialtyId,Practitioner.Available_Appointment_Type__c  FROM HealthcareProviderSpecialty WHERE PractitionerId=:doctId AND AccountId=:hospId  ];
      }
        return getAccountId;
    }
}