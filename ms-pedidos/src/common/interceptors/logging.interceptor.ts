import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
    Logger,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
    private readonly logger = new Logger('HTTP');

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const request = context.switchToHttp().getRequest();
        const { method, url, user } = request;
        const timestamp = new Date().toISOString();
        const userEmail = user?.email || 'Anonymous';

        return next.handle().pipe(
            tap((data) => {
                const response = context.switchToHttp().getResponse();
                const statusCode = response.statusCode;
                this.logger.log(
                    `[${timestamp}] ${method} ${url} - User: ${userEmail} - Status: ${statusCode} - Success`,
                );
            }),
            catchError((error) => {
                const statusCode = error.status || 500;
                this.logger.error(
                    `[${timestamp}] ${method} ${url} - User: ${userEmail} - Status: ${statusCode} - Error: ${error.message}`,
                );
                return throwError(() => error);
            }),
        );
    }
}
