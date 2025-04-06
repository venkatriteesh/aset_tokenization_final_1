import { create } from "ipfs-http-client";

// IPFS Configuration
const ipfs = create({
  host: "ipfs.infura.io",
  port: 5001,
  protocol: "https",
  headers: {
    authorization: `Basic ${Buffer.from("059fa00d271845699ec8b0827d1a9758:64odAwHd7N6t8MrCWkQj7Sa3z514yWyO+5AWYp9cqDS1I5tabu6V+w").toString("base64")}`,
  },
});

// Function to test IPFS upload
async function testIpfsUpload(file) {
  try {
    const result = await ipfs.add(file);
    console.log("IPFS CID:", result.path);
    return result.path;
  } catch (error) {
    console.error("IPFS Upload Error:", error);
    throw error;
  }
}

// Example usage
const testFile = new Blob(["Hello, IPFS!"], { type: "text/plain" });
testIpfsUpload(testFile).then(cid => {
  console.log(`File uploaded successfully with CID: ${cid}`);
}).catch(error => {
  console.error("Error during IPFS upload:", error);
});
