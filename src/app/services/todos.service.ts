import {Injectable} from '@angular/core';
import {TODOS} from '../models/mock-data';

@Injectable({
    providedIn: 'root'
})
export class TodosService {
    async getTodos() {
        await sleep(1000);
        return TODOS;
    }
}

async function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
