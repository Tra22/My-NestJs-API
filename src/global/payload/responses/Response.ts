import { Metadata } from "./Metadata";

export class Response<T> {
    constructor(data: T, statusCode: number, metaData: Metadata, details: any = null){
        if(data instanceof Array){
            this.data = data;
        }else {
            this.data = {...data, details: details};
        }
        this.statusCode = statusCode;
        this.metadata = metaData;
    }
    private data: T;
    private statusCode: number;
    private metadata: Metadata;

    public static ok<T>(): Response<string> {
        return new Response('Successfully', 200, new Metadata());
    }

    public static data<T>(data: T): Response<T>{
        return new Response(data, 200, new Metadata());
    }
    public static error<T>(statusCode: number, data: T, details=null): Response<T>{
        return new Response(data, statusCode, new Metadata(), details);
    }
}