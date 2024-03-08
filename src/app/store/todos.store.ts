import {Todo} from '../models/todo.model';
import {patchState, signalStore, withComputed, withMethods, withState} from '@ngrx/signals';
import {computed, inject} from '@angular/core';
import {TodosService} from '../services/todos.service';

export type TodosFilter = 'all' | 'pending' | 'completed';

type TodosState = {
    todos: Todo[];
    loading: boolean;
    filter: TodosFilter;
    auth: {
        user: {
            name: string,
            roles: string[]
        }
    };
}

const initialState: TodosState = {
    todos: [],
    loading: false,
    filter: 'all',
    auth: {
        user: {
            name: 'John',
            roles: ['admin']
        }
    }
};

export const TodosStore = signalStore(
    {providedIn: 'root'},
    withState(initialState),
    withMethods(
        (store, todosService = inject(TodosService)) => ({
            async loadAll() {
                patchState(store, {loading: true});
                const todos = await todosService.getTodos();
                patchState(store, {todos, loading: false});
            },

            async addTodo(title: string) {
                const todo = await todosService.addTodo({title, completed: false});
                patchState(store, (state) => ({
                    todos: [todo, ...state.todos]
                }));
            },

            async deleteTodo(id: string) {
                await todosService.deleteTodo(id);
                patchState(store, (state) => ({
                    todos: state.todos.filter(todo => todo.id !== id)
                }));
            },

            async updateTodo(id: string, completed: boolean) {
                await todosService.updateTodo(id, completed);
                patchState(store, (state) => ({
                    todos: state.todos.map(todo =>
                        todo.id === id ? {...todo, completed} : todo
                    )
                }));
            },

            updateFilter(filter: TodosFilter) {
                patchState(store, {filter});
            }
        })
    ),
    withComputed((state) => ({
        filteredTodos: computed(() => {

            const todos = state.todos();

            switch (state.filter()) {
                case 'pending':
                    return todos.filter(todo => !todo.completed);
                case 'completed':
                    return todos.filter(todo => todo.completed);
                default:
                    return todos;
            }

        })
    }))
);
