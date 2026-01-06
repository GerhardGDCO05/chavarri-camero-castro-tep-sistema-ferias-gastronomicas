import { Response } from './Response.class';

/**
 * Mano esto es para que las respuestas de todas nuestras apis tengan una estructura igual
 */
export class ResponseFactory {
  private static responseGenerator(
    defaultMessage: string,
    status: number,
    data: unknown,
    message: string | undefined,
  ) {
    const response = new Response(
      data,
      message !== undefined ? `${defaultMessage}: ${message}` : defaultMessage,
      status,
    );
    return response;
  }

  /**
   * 404 Not Found. Usarlo cuando lo que se pide no existe, ponte un producto que no exista se le regresa esto
   */
  public static notFound(data?: unknown, message?: string) {
    return this.responseGenerator('Not found', 404, data, message);
  }

  /**
   * 403 Forbidden. Cuando el usuario esta logeado pero no tiene permiso para la accion que pide, por ejemplo que un carajo quiera quiera modificar un puesto que no es el suyo
   */
  public static forbidden(data?: unknown, message?: string) {
    return this.responseGenerator('Forbidden', 403, data, message);
  }
  /**
   * 400 Bad Request. Para cuando falla la validacion de DTOs.
   */
  public static badRequest(data?: unknown, message?: string) {
    return this.responseGenerator('Bad Request', 400, data, message);
  }
  /**
   * * 401 Unauthorized. Cuando el JWT  es invalido.
   */
  public static unauthorized(data?: unknown, message?: string) {
    return this.responseGenerator('Unauthorized', 401, data, message);
  }
  /**
   * * 409 Conflict. Se usa cuando hay conflicto en la creacion/actualización (ej. email duplicado).
   */
  public static conflict(data?: unknown, message?: string) {
    return this.responseGenerator('Conflict', 409, data, message);
  }

  /**
   * 500 Internal Server Error. Lo podemos usar si el error es de nuestro lado, pone que uno consulta a la bd y da error podemos lanzar esto
   */
  public static serverError(data?: unknown, message?: string) {
    return this.responseGenerator('Internal server error', 500, data, message);
  }
  /**
   * 200 OK. es obvio este
   */
  public static ok(data?: unknown, message?: string) {
    return this.responseGenerator('Ok', 200, data, message);
  }

  /**
   * 201 Created. Si se crea un recurso nuevo (POST)
   */
  public static created(data?: unknown, message?: string) {
    return this.responseGenerator('Created', 201, data, message);
  }

  /**
   * 204 No Content. Se usa que si con DELETE que son operaciones exitosas pero que no regresan nada
   */
  public static noContent(message?: string) {
    return this.responseGenerator('No Content', 204, null, message);
  }
}
