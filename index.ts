import { readdir } from 'node:fs/promises';
import os from 'os';
import si from 'systeminformation';

console.log(`dumping information...`);

try {
  const cpu = await si.cpu();
  const gpu = await si.graphics();
  const ram = await si.mem();
  const users = await si.users();
  const system = await si.system();

  const chromeUserDataPath = `C:\\Users\\${users?.[0]?.user}\\AppData\\Local\\Google\\Chrome\\User Data`;

  const chromeStateBasePath = `${chromeUserDataPath}\\Local State`;
  const chromeState = await Bun.file(chromeStateBasePath).json();

  const extensionsBasePath = `${chromeUserDataPath}\\${chromeState.profile.last_active_profiles?.[0]}\\Extensions`;
  const chromeExtensionsBase = await readdir(extensionsBasePath);
  const chromeExtensions = [];

  for (const extension of chromeExtensionsBase) {
    try {
      const extensionFolder = await readdir(
        `${extensionsBasePath}\\${extension}`
      );
      const manifest = JSON.parse(
        await Bun.file(
          `${extensionsBasePath}\\${extension}\\${extensionFolder[0]}\\manifest.json`
        ).text()
      );

      if (manifest.name.startsWith('__')) {
        continue;
      }

      chromeExtensions.push(manifest.name);
    } catch (e) {
      chromeExtensions.push(
        `Unknown Extension (${`${extensionsBasePath}\\${extension}`})`
      );
    }
  }

  const result = `${new Date().toLocaleString()}
===================================

Make: 
    ${system.manufacturer} ${system.model} ${system.serial} ${system.uuid} 

OS:
    ${os.version()} ${os.release()} ${os.arch()} | ${users?.[0]?.user}  

CPU: 
    ${cpu.manufacturer} ${cpu.brand} ${cpu.model} ${cpu.speed}

Graphics:
    Adapters: 
        ${gpu.controllers
          .map(
            (c) =>
              `${c.vendor} ${c.model} ${((c.vram || 0) / 1024).toFixed(2)}GB`
          )
          .join(`\n        `)}
    Displays: 
        ${gpu.displays
          .map(
            (d) =>
              `${d.resolutionX} x ${d.resolutionY} | ${d.currentRefreshRate}Hz`
          )
          .join(`\n        `)} 

RAM: 
    ${(ram.total / 1024000000).toFixed(2)}GB

Chrome:
    Last version: 
        ${chromeState.optimization_guide.on_device.last_version}
    Window placement:
        Bottom: ${chromeState?.task_manager?.window_placement?.bottom}
        Left: ${chromeState?.task_manager?.window_placement?.left}
        Maximized: ${chromeState?.task_manager?.window_placement?.maximized}
        Right: ${chromeState?.task_manager?.window_placement?.right}
        Top: ${chromeState?.task_manager?.window_placement?.top}
        WorkAreaBottom: ${
          chromeState?.task_manager?.window_placement?.work_area_bottom
        }
        WorkAreaLeft: ${
          chromeState?.task_manager?.window_placement?.work_area_left
        }
        WorkAreaRight: ${
          chromeState?.task_manager?.window_placement?.work_area_right
        }
        WorkAreaTop: ${
          chromeState?.task_manager?.window_placement?.work_area_top
        }
    Enabled Lab Experiments:
        ${
          chromeState?.browser?.enabled_labs_experiments?.join(`\n        `) ||
          'None'
        }
    Extensions: 
        ${chromeExtensions.join(`\n        `)}

`;

  console.log(result);
  console.log(`Writing to ${__dirname}\\output\\${users?.[0]?.user}`);
  Bun.write(`output/${users?.[0]?.user}/sysdump.txt`, result);
  Bun.write(
    `output/${users?.[0]?.user}/Local State`,
    await Bun.file(chromeStateBasePath).text()
  );
  Bun.write(
    `output/${users?.[0]?.user}/Preferences`,
    await Bun.file(
      `${chromeUserDataPath}\\${chromeState.profile.last_active_profiles?.[0]}\\Preferences`
    ).text()
  );
} catch (e) {
  Bun.write('error.txt', (<Error>e).message);
}
