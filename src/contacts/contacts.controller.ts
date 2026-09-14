import { Controller, Get } from '@nestjs/common';
import { ContactsService } from './contacts.service.js';

@Controller('contacts')
export class ContactsController {
    constructor(private readonly contactsService: ContactsService) {}
    
    @Get()
    getAllContacts() {
        return this.contactsService.getAllContacts();
    }
}
