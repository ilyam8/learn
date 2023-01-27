---
title: "1-Wire Sensors monitoring with Netdata"
custom_edit_url: null
sidebar_label: "1-Wire sensors"
---



Monitors sensor temperature.

On Linux these are supported by the wire, w1_gpio, and w1_therm modules.
Currently temperature sensors are supported and automatically detected.

Charts are created dynamically based on the number of detected sensors.

## Configuration

Edit the `python.d/w1sensor.conf` configuration file using `edit-config` from the Netdata [config
directory](/docs/configure/nodes), which is typically at `/etc/netdata`.

```bash
cd /etc/netdata   # Replace this path with your Netdata config directory, if different
sudo ./edit-config python.d/w1sensor.conf
```

---

