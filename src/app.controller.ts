import { Controller, Get } from '@nestjs/common';

@Controller('')
export class AppController {
    @Get('')
    async hello() {
        return '<h1>QRO AGENDAR API</h1>'
    }
}