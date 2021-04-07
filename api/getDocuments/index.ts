import { APIGatewayProxyEventV2, Context, APIGatewayProxyStructuredResultV2 } from "aws-lambda"

export const getDocuments = async(event: APIGatewayProxyEventV2, context: Context): Promise<APIGatewayProxyStructuredResultV2> => {
    
    
    return  {
        statusCode: 200,
        body: 'Success' // needs to be a string (use json.stringify if it's a complex object)
    }
}