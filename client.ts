import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';

const packageDef = protoLoader.loadSync("./cluster.proto");
const grpcObject = grpc.loadPackageDefinition(packageDef);
const clusterPackage : any = grpcObject.clusterPackage;


const text = process.argv[2]
interface VoidNoParam {}

interface NodeItem {
  id: number;
  nodeName: string;
}

interface NodeItems {
  items: NodeItem[];
}


interface ClusterClient extends grpc.Client {
  allNodes: (
    request: VoidNoParam, 
    callback: (error: grpc.ServiceError | null, response: NodeItems) => void
  ) => grpc.ClientUnaryCall;
}


const client = new clusterPackage.Cluster("localhost:50000", grpc.credentials.createInsecure()) as ClusterClient

client.allNodes({}, (err, response)=>{
  console.log("Read all nodes on cluster " + JSON.stringify(response))
})