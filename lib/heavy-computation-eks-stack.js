const cdk = require("@aws-cdk/core");
const eks = require("@aws-cdk/aws-eks");
const envVars = require("./env.vars.json");

const thundraEnv = [
  ...envVars.thundra,
  {
    name: "THUNDRA_AGENT_REPORT_REST_BASEURL",
    value: "https://api-lab.thundra.io/v1/",
  },
  { name: "THUNDRA_AGENT_APPLICATION_NAME", value: "HC-backend" },
];

const emailEnv = envVars.email;

class HeavyComputationEksStack extends cdk.Stack {
  constructor(scope, id, props) {
    super(scope, id, props);

    const cluster = new eks.Cluster(this, "heavy-computation", {
      version: eks.KubernetesVersion.V1_17,
    });

    cluster.addManifest(
      "backend",
      createServiceSpec("backend-service", "LoadBalancer"),
      createDeploymentSpec(
        "backend",
        "kayis/heavy-computation:backend-thundra",
        thundraEnv
      )
    );

    cluster.addManifest(
      "calculator",
      createServiceSpec("calculator"),
      createDeploymentSpec(
        "calculator",
        "kayis/heavy-computation:calculator-thundra",
        thundraEnv
      )
    );

    cluster.addManifest(
      "email",
      createServiceSpec("email"),
      createDeploymentSpec("email", "kayis/heavy-computation:email-thundra", [
        ...thundraEnv,
        ...emailEnv,
      ])
    );
  }
}

function createServiceSpec(name, type) {
  const manifest = {
    apiVersion: "v1",
    kind: "Service",
    metadata: { name },
    spec: { selector: { app: name }, ports: [{ port: 8000 }] },
  };

  if (type) manifest.spec.type = type;

  return manifest;
}

function createDeploymentSpec(name, image, env) {
  return {
    apiVersion: "apps/v1",
    kind: "Deployment",
    metadata: { name },
    spec: {
      selector: { matchLabels: { app: name } },
      template: {
        metadata: { labels: { app: name } },
        spec: {
          containers: [{ name, image, ports: [{ containerPort: 8000 }], env }],
        },
      },
    },
  };
}

module.exports = { HeavyComputationEksStack };
