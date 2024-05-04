# Setup custom TURN server

I've followed this article to setup my TURN server in AWS ES 2 instance.

[https://medium.com/@otacorporation0520/set-up-stun-turn-server-for-the-video-chat-app-ee8dc6fb9b15](https://medium.com/@otacorporation0520/set-up-stun-turn-server-for-the-video-chat-app-ee8dc6fb9b15)

## Steps

### Step 1: Create EC2 instance

I’ll use ubuntu latest versions (ie 24.04 for me) server on EC2 instance. So if you haven’t created it, please do so.

### Step 2: Configure AWS Security group (Incoming) and Firewall rules

First, please make sure to open the following ports in AWS security Groups(Incoming).

```bash
3478 : UDP
3478 : TCP
49152–65535 : UDP
```

### Step 3: Install coturn

We are going to install `coturn` package which is a free open-source implementation of TURN and STUN Server.

```bash
sudo apt-get -y update
sudo apt-get install coturn
```

### Step 4: Start the coturn Daemon at Startup

We need to enable TURNSERVER_ENABLED property in the/etc/default/coturn file to start turnserver with default configuration at system boot.

```bash
sudo vi /etc/default/coturn
```

Uncomment the following line.

```txt
TURNSERVER_ENABLED=1
```

### Step 5: Run TURN server

Run the following command with your details to start TURN server.

```bash
turnserver -a -o -v -n -u <username>:<password> -p 3478 -r someRealm -X <Public_IP>/<Private_IP> --no-dtls --no-tls
```

For example

```bash
turnserver -a -o -v -n -u user:root -p 3478 -r someRealm -X 13.54.1.1/172.31.1.1 — no-dtls — no-tls
```

-X — your amazon instance’s public IP, private IP: public IP/private IP
-p — port to be used, default 3478
-a — Use long-term credentials mechanism
-o — Run server process as daemon
-v — ‘Moderate’ verbose mode.
-n — no configuration file
— no-dtls — Do not start DTLS listeners
— no-tls — Do not start TLS listeners
-u — user credentials to be used
-r — default realm to be used, need for TURN REST API

### Step 6: Test

Go to the Trickle ICE page and enter your own TURN server details.

Set below information

```bash
STUN or TURN URI: turn:<public IP>:3478?transport=tcp
TURN username: <username>
TURN password: <password>
```

Click Add Server button once above fields are filled.

Then, click Gather candidates button. The result will look like this. If it shows an error or it didn't show `Done` at the end, the configuration might be wrong.

### Step 7: - How to configure TURN server in the app

```js
const peer = new RTCPeerConnection({
  iceServers: [
    // FREE stun servers
    {
      urls: [
        "stun:stun.l.google.com:19302",
        "stun:global.stun.twilio.com:3478",
      ],
    },
    // CUSTOM TURN SERVER
    {
      urls: ["TURN_SERVER"], // Your turn address
      username: "TURN_USERNAME", // Your username
      credential: "TURN_PASSWORD", // Your password
    },
  ],
});
```
