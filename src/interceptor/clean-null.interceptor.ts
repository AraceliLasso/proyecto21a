import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class CleanNullInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const request = context.switchToHttp().getRequest();
        if (request.body) {
            request.body = this.clean(request.body);
        }
        return next.handle();
    }

    private clean(obj: any) {
        return Object.entries(obj).reduce((acc, [key, value]) => {
            if (value !== null && value !== undefined) {
                acc[key] = value;
            }
            return acc;
        }, {});
    }
}
