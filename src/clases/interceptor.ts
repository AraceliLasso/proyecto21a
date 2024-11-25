import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
    } from '@nestjs/common';
    import { Observable } from 'rxjs';

    @Injectable()
    export class TransformInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const request = context.switchToHttp().getRequest();
        if (request.body.disponibilidad) {
        request.body.disponibilidad = parseInt(request.body.disponibilidad, 10);
        }
        return next.handle();
    }
    }