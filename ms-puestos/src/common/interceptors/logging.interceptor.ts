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
        // In microservices using TCP, we might not have 'method' or 'url' in the same way as HTTP
        // but we can log the pattern or data. For now, we'll try to handle both or just basic info.

        if (!request) {
            // It's likely a microservice context (RPC/TCP)
            const rpcContext = context.switchToRpc();
            const data = rpcContext.getData();
            const pattern = context.getHandler().name; // Or use metadata if available
            const timestamp = new Date().toISOString();

            return next.handle().pipe(
                tap(() => {
                    this.logger.log(`[${timestamp}] RPC ${pattern} - Context: Microservice - Success`);
                }),
                catchError((error) => {
                    this.logger.error(`[${timestamp}] RPC ${pattern} - Error: ${error.message}`);
                    return throwError(() => error);
                })
            );
        }

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
