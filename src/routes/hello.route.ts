import { Controller, Get, Route, Path } from 'tsoa';

@Route('hello')
export class HelloController extends Controller {
    @Get('{name}')
    public async sayHello(@Path() name: string): Promise<{ message: string }> {
        return { message: `Hello ${name}` };
    }
}
