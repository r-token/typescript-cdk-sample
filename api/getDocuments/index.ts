import { APIGatewayProxyEventV2, Context, APIGatewayProxyStructuredResultV2 } from "aws-lambda"

const bucketName = process.env.DOCUMENTS_BUCKET_NAME

export const getDocuments = async(event: APIGatewayProxyEventV2, context: Context): Promise<APIGatewayProxyStructuredResultV2> => {
    console.log(`Bucket name: ${bucketName}`)
    
    return  {
        statusCode: 200,
        body: 'Success' // needs to be a string (use json.stringify if it's a complex object)
    }
}