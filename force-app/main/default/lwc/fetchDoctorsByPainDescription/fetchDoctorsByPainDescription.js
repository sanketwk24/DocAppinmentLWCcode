
import { LightningElement, track, wire, api } from 'lwc';
import ZoomMeetingIcon from '@salesforce/resourceUrl/ZoomMeetingIcon';
import Healthcloudimg1 from '@salesforce/resourceUrl/Healthcloudimg1';
import fetchDoctorsByPain from '@salesforce/apex/FetchDoctors.fetchDoctorsByPain';
import getTimeSlot from '@salesforce/apex/FetchDoctors.getTimeSlots';
import getAccountIdByContactId from '@salesforce/apex/FetchDoctors.getAccountIdByContactId';
import getinsertDummyAttachment from '@salesforce/apex/FetchDoctors.insertDummyAttachment';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getcreatefacilities from '@salesforce/apex/FetchDoctors.createfacilities';
import getfetchSpecialityHospiatalByDoctor from '@salesforce/apex/FetchDoctors.fetchSpecialityHospiatalByDoctor';






export default class FetchDoctorsByPainDescription extends LightningElement {
    ZoomMeetingIcon;
    Healthcloudimg1;
    data;
   // imagep;
    BookAnAppointment;
    @track showZoompopup = false;
   // @track painDescription = '';
     @track doctors;
    @track error;
    @track accId;
    @track conId;
    @track mydata = [];
    @track doctor = [];
    @track docacc = [];
    @track isShowModal = false;
    @api patientId = '0014x00001SkvDNAAZ';
    @track radioclick;
    @track radioinflow;
    @track emailZone;
    @track contactId;
    @track contactRecords = [];
    @api WorkTypeId;
    @api WorkTypeGroupId;
    @api timezonename;
    @api territoryId;
    @api resourceId;
    @api appTypeName;
    @api inputVariables;
    @track FlowPopup = false;
    @api accounts;
    @api contacts;
    @api attachmentId;
    @api carespeciality;
    @track docId;
    @track hosId;
    @track speciality;
    @track count;
    @track isDisabled;
    @track totalPages;
    @track currentPage =1;

    

     connectedCallback(){
        this.ZoomMeetingIcon = ZoomMeetingIcon;
        this.Healthcloudimg1 = Healthcloudimg1;
     }

     BookAnAppointment(event){
        this.showZoompopup = true;
        //this.BookAnAppointment = event.target.value;
        
     }   

    @wire(fetchDoctorsByPain)
    wiredDoctors({ data, error }) {
        
        if (data) {
          
            this.doctors = data;
            this.docId = this.doctors[1].Id;
            console.log(this.docId);
           this.hosId= this.doctors[1].AccountId;
           console.log(this.hosId);
           this.count = this.doctors.length;
           //alert(this.count);

           // this.getcarespeciality();
            this.error = undefined;
        } else if (error) {
            this.error = error; 
            this.doctors = undefined;
        }
    }
       
    @wire(getfetchSpecialityHospiatalByDoctor,{doctId: '$docId', hospId: '$hosId'})
    wiredcare({data,error}){
        if(data){
            this.carespeciality = data;
            console.log(this.carespeciality);
           this.speciality = this.carespeciality.Specialty.Name;
           console.log('Specialty > ' +this.speciality);
            this.error = undefined;
        } else if (error) {
            this.error = error; 
            console.log(this.error);
            this.doctors = undefined;
        }
    }

    updatePaginatedDoctors() {
        const start = (this.currentPage - 1) * this.recordsPerPage;
        const end = start + this.recordsPerPage;
        this.paginatedDoctors = this.doctors.slice(start, end);
    }

    handleNextPage() {
        if (this.currentPage < this.totalPages) {
            this.currentPage++;
            this.updatePaginatedDoctors();
        }
    }

    handlePreviousPage() {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.updatePaginatedDoctors();
        }
    }
    @api accId; // Public property to accept account ID
    @track showPopUp = false;
    @track timeSlots = [];

    handleShowPopover(event) {
        //alert(`Contact Id: ${this.conId}, Account Id: ${this.accId}`);
        this.showPopUp = true;
        this.contactId = event.target.value;
        //alert(contactId); 
            
        getAccountIdByContactId({ contactId: this.contactId })
        .then(result => {
            //alert(result);
            this.accountId = result;
            console.log(this.accountId); 

           
           return getTimeSlot({ contctId: this.contactId, accntId: this.accountId });
        })
            .then(result => {
                var hours = [];
               // alert(result);
                result.forEach(slot => {
                    var singleObj = {};
                    singleObj.DayOfWeek = slot.DayOfWeek;

                    if (slot.StartTime >= 0) {
                        var startTime = new Date(slot.StartTime);
                        var startTimeString = this.formatTime(startTime);
                        singleObj.StartTime = startTimeString;
                    }

                    if (slot.EndTime >= 0) {
                        var endTime = new Date(slot.EndTime);
                        var endTimeString = this.formatTime(endTime);
                        singleObj.EndTime = endTimeString;
                    }

                    hours.push(singleObj);
                });

                this.mydata = hours;
               // alert(JSON.stringify(this.mydata));
               
            })
            .catch(error => {
                console.error('Error retrieving time slots:', error);
            });

            
    }

   
    formatTime(time) {
        var hours = time.getHours();
        var minutes = time.getMinutes();
        var AmOrPm = hours >= 12 ? 'pm' : 'am';
        hours = hours % 12 || 12;
        minutes = minutes < 10 ? '0' + minutes : minutes;
        return hours + ':' + minutes + ' ' + AmOrPm;
    }

    hideTimeModal(){
        this.showPopUp = false;
        this.mydata = [];
    }
    handleClose(){
        this.showPopUp = false;
    }
   

    async BookAppointment(event) {  
        
        this.conId = event.target.value;
       // alert(this.conId);
        getAccountIdByContactId({ contactId: this.conId })
        .then(result => {
            this.accountId = result;
            console.log(this.accountId);    
        })
        .catch((error) => {
            console.error('Error:', error);
        });
        try {
            const account = await  getAccountIdByContactId({ contactId: this.conId });
            this.accountId = account;
          
        } catch (error) {
            console.error('Error in getinsertDummyAttachment:', error);
            return;
        }
       
       
        try {
            const recordResult = await  getTimeSlot({ contctId: this.conId, accntId:  this.accountId });
            this.data = recordResult;
            
    
            if (this.data != null){
                this.isShowModal = true; 
            }
        }
    
        catch(error){
            this.isShowModal = false;
            const toastEvent = new ShowToastEvent({
                title: 'Error',
                message: 'No Time Slot Available for this Doctor',
                duration: 3000,
                key: 'info_alt',
                type: 'error',
                mode: 'pester'
            });
            this.dispatchEvent(toastEvent);
            this.conId='';
            console.error('Error:', error);
            
        }
    }
    

    hideModalBox() {  
        this.isShowModal = false;
    }
    handleRadioClick(event){
        this.radioclick =  event.target.value;
    }
    hideExampleModalForFlows(){
        this.FlowPopup = false;
      
      }
      previousActionToFlow(){
        this.isShowModal = false;
      }
     
    
    
    async nextActionToFlow() {
        this.radioinflow = this.radioclick;
        this.accounts = this.accountId;
        this.contacts = this.conId;
        console.log('accounts > ' + this.accounts);
        console.log('contacts > ' + this.contacts);
        
       
        try {
            const attachmentResult = await getinsertDummyAttachment({ PatientId: this.patientId });
            this.attachmentId = attachmentResult;
            console.log('VarSubjectId > ' + this.attachmentId);
        } catch (error) {
            console.error('Error in getinsertDummyAttachment:', error);
            return;
        }
    
        if (this.radioinflow == null) {
            const toastEvent = new ShowToastEvent({
                title: 'Error',
                message: 'Please select the Appointment Type',
                duration: 5000,
                key: 'info_alt',
                type: 'error',
                mode: 'pester'
            });
            this.dispatchEvent(toastEvent);
            return;
        }
    
        try {
            const facilitiesResult = await getcreatefacilities({ accntId: this.accountId, contctId: this.conId });
            this.data = facilitiesResult;
            console.log('facilitiesResult > ' +JSON.stringify(this.data));
    
            if (this.data != null){
                

                this.WorkTypeId = this.data.workTypeName.WorkTypeId;
                console.log('WorkTypeId > ' + this.WorkTypeId);
    
                this.WorkTypeGroupId = this.data.workTypeGroupName.WorkTypeGroupId;
                console.log('WorkTypeGroupId > ' + this.WorkTypeGroupId);
    
                this.timezonename = this.data.practitionerfacility.ServiceTerritoryMember.ServiceTerritory.OperatingHours.TimeZone;
                console.log('timezonename > ' + this.timezonename);
    
                this.territoryId = this.data.practitionerfacility.ServiceTerritoryMember.ServiceTerritoryId;
                console.log('territoryId > ' + this.territoryId);
    
                this.resourceId = this.data.practitionerfacility.ServiceTerritoryMember.ServiceResourceId;
                console.log('resourceId > ' + this.resourceId);
            }
        } catch (error) {
           // this.isDisabled = true;
           const toastEvent = new ShowToastEvent({
            title: 'Error',
            message: 'No Time Slot Available for this Doctor',
            duration: 5000,
            key: 'info_alt',
            type: 'error',
            mode: 'pester'
        });
        this.dispatchEvent(toastEvent);
        return;
            
        }
            // if(this.data == null){
                
            // }
        this.isShowModal = false;
        this.FlowPopup = true;
        this.appTypeName = this.radioclick;
       // alert('appTypeName >' +this.appTypeName);
       console.log('appTypeName > ' +this.appTypeName);
       
      this.inputVariables = [
        {
            name:"varLeadId",
            type:"String",
            value:this.patientId
        },
        {
            name:"varTerrId",
            type:"String",
            value: this.territoryId
        },
        
        {
            name:"varResourceId",
            type:"String",
            value: this.resourceId
        },
        {
            name:"varAccountId",
            type:"String",
            value:this.accounts
        },
        {
            name:"varContactId",
            type:"String",
            value: this.contacts
        },
        
        {
            name:"WorkTypeGroupId",
            type:"String",
            value: this.WorkTypeGroupId
        },
        
        {
            name:"varTimeZone",
            type:"String",
            value:this.timezonename
        },
        {
            name:"VarSubjectId",
            type:"String",
            value:this.attachmentId
        },
        {
            name:"varAppTypeName",
            type:"String",
            value:this.appTypeName
        }
        
    ];
    console.log('inputVariables > ' +JSON.stringify(this.inputVariables));
    
    
 }
        
 


      }
      
     
    
     
