const os = require("os");
const ping = require("ping");
const { exec } = require("promisify-child-process");

const getYourLocalSubnet = () => {
  const interface = os.networkInterfaces();
  let myIp;
  // interface has an array of obj
  for (let ArrayName in interface) {
    for (let iface of interface[ArrayName]) {
      if (iface.address.startsWith("192")) {
        myIp = iface.address;
      }
    }
  }
  return myIp;
};

async function pingall(start, end) {
  let promises = [];
  for (let i = 1; i <= 254; i++) {
    let ip = `192.168.1.${i}`;

    const p = ping.promise.probe(ip, { timeout: 1 }).catch((err) => {
      return { host: ip, alive: false, error: err };
    });
    promises.push(p);
  }
  const result = await Promise.allSettled(promises);
  // console.log(result);
  const alivehost = result.filter(
    (res) => res.status === "fulfilled" && res.value.alive
  );
  let ipAlive = alivehost.map((h) => h.value.host);
  // console.log(ipAlive);
  cmdNode();
}

async function cmdNode() {
  exec("arp -a", async (err, stdout, stderr) => {
    const lines = stdout.split("\n");

    lines.forEach(async (e) => {
      if (e.includes("dynamic")) {
        const parts = e.trim().split(/\s+/);
        const ip = parts[0];
        const mac = parts[1];
        let L0calNetworkUser = ` IP:${ip}  MAC:${mac}`.trim().split(/\s+/);
        console.log(L0calNetworkUser);
      }
    });
  });
}

console.log(getYourLocalSubnet());
window.onload = pingall(1, 254);
pingall(1, 254);
