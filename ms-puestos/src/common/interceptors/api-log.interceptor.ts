import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApiLog } from '../../entities/api-log.entity';

@Injectable()
export class ApiLogInterceptor implements NestInterceptor {
    constructor(
        @InjectRepository(ApiLog)
        private readonly apiLogRepository: Repository<ApiLog>,
    ) { }

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const request = context.switchToHttp().getRequest();
        const { method, url, user } = request;

        return next.handle().pipe(
            tap({
                next: (data) => {
                    const response = context.switchToHttp().getResponse();
                    this.saveLog(url, method, user?.id, response.statusCode, 'Success');
                },
                error: (error) => {
                    const statusCode = error.status || 500;
                    this.saveLog(url, method, user?.id, statusCode, error.message);
                },
            }),
        );
    }

    private async saveLog(route: string, method: string, userId: string, statusCode: number, message: string) {
        try {
            const log = this.apiLogRepository.create({
                route,
                method,
                userId,
                statusCode,
                message: message.substring(0, 500), // Limitar longitud
            });
            await this.apiLogRepository.save(log);
        } catch (err) {
            console.error('Error saving API log:', err);
        }
    }
}
