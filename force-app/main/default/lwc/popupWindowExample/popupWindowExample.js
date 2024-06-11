import { LightningElement, api, track, wire } from 'lwc';
import getTimeSlots from '@salesforce/apex/FetchDoctors.getTimeSlots';

export default class MyComponent extends LightningElement {
    @track isShowModal = false;

    showModalBox() {  
        this.isShowModal = true;
    }

    hideModalBox() {  
        this.isShowModal = false;
    }
}
