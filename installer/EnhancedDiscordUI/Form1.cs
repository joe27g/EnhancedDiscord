using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;
using System.Diagnostics;
using System.IO;
using System.Net;
using System.IO.Compression;
using System.Runtime.InteropServices;

namespace EnhancedDiscordUI
{
    public partial class EDInstaller : Form
    {
        private Process stableProcess;
        private Process ptbProcess;
        private Process canaryProcess;
        private Process devProcess;
        private string operation = "INSTALL";
        private string platform;

        public EDInstaller()
        {
            InitializeComponent();
            if (Directory.Exists("./EnhancedDiscord"))
            {
                UninstallButton.Enabled = true;
                UpdateButton.Enabled = true;
            }
        }
        private void endInstallation(string reason, bool failed)
        {
            InstallProgress.Value = 100;
            InstallButton.Hide();
            UninstallButton.Hide();
            UpdateButton.Hide();
            StatusText.Hide();
            StatusLabel.Show();
            StatusLabel.Text = (operation == "UNINSTALL" ? "Unin" : "In") + "stallation " + (failed ? " failed." : "completed!");
            StatusLabel2.Show();
            StatusLabel2.Text = reason;
            StatusCloseButton.Show();
            if (platform != "Linux")
            {
                OpenFolderButton.Show();
            }
        }
        private void InstallButton_Click(object sender, EventArgs e)
        {
            InstallButton.Hide();
            UninstallButton.Hide();
            UpdateButton.Hide();
            StatusText.Show();
            InstallProgress.Show();
            StatusText.Text = "Finding Discord processes...";

            Process[] stable = Process.GetProcessesByName("Discord");
            Process[] canary = Process.GetProcessesByName("DiscordCanary");
            Process[] ptb = Process.GetProcessesByName("DiscordPtb");
            Process[] dev = Process.GetProcessesByName("DiscordDevelopment");

            List<Process> discordProcesses = new List<Process>();
            discordProcesses.AddRange(stable);
            discordProcesses.AddRange(canary);
            discordProcesses.AddRange(ptb);
            discordProcesses.AddRange(dev);

            if (discordProcesses.Count == 0)
            {
                endInstallation("No Discord processes found. Please open Discord and try again.", true); return;
            }
            List<Process> uniqueProcesses = new List<Process>();
            // First look for processes with unique filenames that have a title
            for (int i = 0; i < discordProcesses.Count; i++)
            {
                bool isUnique = true;
                for (int j = 0; j < uniqueProcesses.Count; j++)
                {
                    if (uniqueProcesses[j].MainModule.FileName.Equals(discordProcesses[i].MainModule.FileName))
                    {
                        isUnique = false; break;
                    }
                }
                if (!isUnique || discordProcesses[i].MainWindowTitle == "" || discordProcesses[i].MainWindowTitle.StartsWith("Developer Tools")) continue;

                uniqueProcesses.Add(discordProcesses[i]);
            }
            // Then look for all processes with unique filenames
            for (int i = 0; i < discordProcesses.Count; i++)
            {
                bool isUnique = true;
                for (int j = 0; j < uniqueProcesses.Count; j++)
                {
                    if (uniqueProcesses[j].MainModule.FileName.Equals(discordProcesses[i].MainModule.FileName))
                    {
                        isUnique = false; break;
                    }
                }
                if (!isUnique) continue;
                uniqueProcesses.Add(discordProcesses[i]);
            }
            StatusText.Text = "Found " + uniqueProcesses.Count + " Discord process" + (uniqueProcesses.Count == 1 ? "" : "es") + ".";
            InstallProgress.Value = 10;
            Process finalProcess = uniqueProcesses[0];
            if (uniqueProcesses.Count > 1)
            {
                // Enable selection buttons
                List<Button> clients = new List<Button>();
                for (int i = 0; i < uniqueProcesses.Count; i++)
                {
                    if (canary.Contains(uniqueProcesses[i]))
                    {
                        CanaryButton.Show();
                        clients.Add(CanaryButton);
                        canaryProcess = uniqueProcesses[i];
                    }
                    else if (ptb.Contains(uniqueProcesses[i]))
                    {
                        PTBButton.Show();
                        clients.Add(PTBButton);
                        ptbProcess = uniqueProcesses[i];
                    }
                    else if (dev.Contains(uniqueProcesses[i]))
                    {
                        DevButton.Show();
                        clients.Add(DevButton);
                        devProcess = uniqueProcesses[i];
                    }
                    else if (stable.Contains(uniqueProcesses[i]))
                    {
                        StableButton.Show();
                        clients.Add(StableButton);
                        stableProcess = uniqueProcesses[i];
                    }
                }
                // position buttons correctly
                if (clients.Count == 3)
                {
                    clients[0].Left = 55;
                    clients[1].Left = 131;
                    clients[2].Left = 207;
                }
                else if (clients.Count == 2)
                {
                    clients[0].Left = 88;
                    clients[1].Left = 164;
                }
                return; // stuff continues w/ button events
            }
            continueInstall(finalProcess);
        }

        private void StableButton_Click(object sender, EventArgs e)
        {
            continueInstall(stableProcess);
        }

        private void PTBButton_Click(object sender, EventArgs e)
        {
            continueInstall(ptbProcess);
        }

        private void CanaryButton_Click(object sender, EventArgs e)
        {
            continueInstall(canaryProcess);
        }

        private void DevButton_Click(object sender, EventArgs e)
        {
            continueInstall(devProcess);
        }

        private async void continueInstall(Process proc)
        {
            string path = proc.MainModule.FileName;
            string release = "discord";
            if (path.Contains("DiscordPTB"))
            {
                release = "discordptb";
            }
            else if (path.Contains("DiscordCanary"))
            {
                release = "discordcanary";
            }
            else if (path.Contains("DiscordDevelopment"))
            {
                release = "discorddevelopment";
            }
            StableButton.Hide();
            PTBButton.Hide();
            CanaryButton.Hide();
            DevButton.Hide();

            StatusText.Text = "Injecting...";
            InstallProgress.Value = 20;

            string dLocation = Path.GetDirectoryName(path);
            platform = "";
            if (RuntimeInformation.IsOSPlatform(OSPlatform.Windows))
            {
                platform = "Windows";
            }
            else if (RuntimeInformation.IsOSPlatform(OSPlatform.Linux))
            {
                platform = "Linux";
            }
            else if (RuntimeInformation.IsOSPlatform(OSPlatform.OSX))
            {
                platform = "Mac";
            }
            StatusText.Text = "Detected platform: " + platform + " | Discord release: " + release;

            string basePath;
            string appVersion = dLocation.Substring(dLocation.IndexOf("app-") + 4);
            if (platform == "Windows")
            {
                basePath = Path.GetDirectoryName(Path.GetDirectoryName(Path.GetDirectoryName(dLocation)));
                basePath = Path.Combine(basePath, "Roaming");
            }
            else if (platform == "Mac")
            {
                basePath = Environment.GetFolderPath(Environment.SpecialFolder.Personal);
                basePath = Path.Combine(basePath, "Library", "Application Support");
            }
            else
            {
                basePath = Environment.GetEnvironmentVariable("XDG_CONFIG_HOME");
                if (basePath == null)
                {
                    basePath = Environment.GetFolderPath(Environment.SpecialFolder.Personal);
                    basePath = Path.Combine(basePath, ".config");
                }
            }
            string[] pathPieces = { basePath, release, appVersion, "modules", "discord_desktop_core", "index.js" };
            // the base "appdata" folder ^        ^       ^
            // i.e. "discord" or "discordcanary" -'       |
            // i.e. "0.0.300" or "0.0.204" ---------------'
            string targetPath = Path.Combine(pathPieces);

            if (targetPath == "" || !File.Exists(targetPath))
            {
                endInstallation("Could not find injection file.", true); return;
            }

            if (operation == "UNINSTALL")
            {
                continueUninstall(proc, targetPath, platform); return;
            }

            string currentContents = File.ReadAllText(targetPath);

            if (currentContents != "module.exports = require('./core.asar');")
            {
                StatusText.Text = "EnhancedDiscord was already injected. Reinjecting...";
            }
            InstallProgress.Value = 30;

            string stuffToInject = Properties.Resources.injection;
            string cd = Directory.GetCurrentDirectory() + "/EnhancedDiscord";
            cd = cd.Replace("\\", "/").Replace("'", "\\'").Replace("/", "\\\\");
            string newContents = "process.env.injDir = '" + cd + "';\n";
            newContents += stuffToInject + "\nmodule.exports = require('./core.asar');";
            try
            {
                File.WriteAllText(targetPath, newContents);
            }
            catch
            {
                endInstallation("Failed to write to injection file.", true); return;
            }
            InstallProgress.Value = 40;
            StatusText.Text = "Successfully injected. Downloading ED...";

            string zipLink = Properties.Resources.zipLink + Properties.Resources.branch;
            WebClient wc = new WebClient();
            try
            {
                await wc.DownloadFileTaskAsync(new Uri(zipLink), "./ED_master.zip");
            }
            catch
            {
                endInstallation("Failed to download ED files.", true); return;
            }
            InstallProgress.Value = 60;
            StatusText.Text = "Successfully downloaded. Extracting...";

            if (Directory.Exists("./EnhancedDiscord") || Directory.Exists("./EnhancedDiscord-" + Properties.Resources.branch))
            {
                DialogResult confirmResult = MessageBox.Show("ED folder already exists. Overwrite it?", "EnhancedDiscord - Confirm Overwrite", MessageBoxButtons.YesNo);
                if (confirmResult == DialogResult.No)
                {
                    endInstallation("Not replacing old ED files.", false); return;
                }
                try
                {
                    if (Directory.Exists("./EnhancedDiscord"))
                    {
                        Directory.Delete("./EnhancedDiscord", true);
                    }
                    if (Directory.Exists("./EnhancedDiscord-" + Properties.Resources.branch))
                    {
                        Directory.Delete("./EnhancedDiscord-" + Properties.Resources.branch, true);
                    }
                }
                catch
                {
                    StatusText.Text = "Error deleting old folders.";
                }
            }
            try
            {
                ZipFile.ExtractToDirectory("./ED_master.zip", "./");
            }
            catch
            {
                endInstallation("Failed to extract zip file.", true); return;
            }
            InstallProgress.Value = 70;
            StatusText.Text = "Finished extracting zip. Cleaning up...";
            try
            {
                Directory.Move("./EnhancedDiscord-" + Properties.Resources.branch, "./EnhancedDiscord");
            }
            catch
            {
                endInstallation("Failed to rename extracted folder.", true); return;
            }

            string[] garbage = new string[] { "./EnhancedDiscord/theme.css", "./EnhancedDiscord/README.md", "./EnhancedDiscord/plugins.md", "./ED_master.zip" };

            foreach (string filePath in garbage)
            {
                if (File.Exists(filePath))
                {
                    try
                    {
                        File.Delete(filePath);
                    }
                    catch
                    {
                        //StatusText.Text = "Failed to delete " + filePath;
                    }
                }
            }
            InstallProgress.Value = 80;
            StatusText.Text = "Finished cleaning up. Creating config.json...";

            bool configSuccess = true;
            if (!File.Exists("./EnhancedDiscord/config.json"))
            {
                try
                {
                    File.WriteAllText("./EnhancedDiscord/config.json", "{}");
                }
                catch
                {
                    configSuccess = false;
                    //StatusText.Text = "Failed to create config.json.";
                }
            }

            InstallProgress.Value = 90;
            StatusText.Text = (configSuccess ? File.Exists("./EnhancedDiscord/config.json") ? "Found" : "Created" : "Failed to create") + " config.json. Relaunching Discord...";
            try
            {
                proc.Kill();
                startDetached(path, null);
            }
            catch
            {
                StatusText.Text = "Failed to restart Discord. Restart it manually to see changes.";
            }
            InstallProgress.Value = 100;
            endInstallation("Finished cleaning up.", false);
            return;
        }

        private void continueUninstall(Process proc, string targetPath, string platform)
        {
            StatusText.Text = "Uninstalling...";
            InstallProgress.Value = 30;

            string path = proc.MainModule.FileName;
            try
            {
                File.WriteAllText(targetPath, "module.exports = require('./core.asar');");
            }
            catch
            {
                endInstallation("Failed to write to injection file.", true); return;
            }

            StatusText.Text = "Successfully uninjected. Deleting old files...";
            InstallProgress.Value = 60;

            if (Directory.Exists("./EnhancedDiscord"))
            {
                DialogResult confirmResult = MessageBox.Show("Would you like to keep your EnhancedDiscord folder?", "EnhancedDiscord - Confirm Delete", MessageBoxButtons.YesNo);
                if (confirmResult == DialogResult.No)
                {
                    bool success = true;
                    StatusText.Text = "Killing Discord process...";
                    try
                    {
                        proc.Kill();
                    }
                    catch
                    {
                        success = false;
                        StatusText.Text = "Failed to kill Discord process. Aborted deletion of ED directory.";
                    }
                    if (success)
                    {
                        try
                        {
                            Directory.Delete("./EnhancedDiscord", true);
                        }
                        catch
                        {
                            StatusText.Text = "Failed to delete EnhancedDiscord directory.";
                        }
                        try
                        {
                            startDetached(path, null);
                        }
                        catch
                        {
                            endInstallation("Uninjected successfully. Failed to restart Discord; do this manually.", false); return;
                        }
                    }
                }
                else
                {
                    try
                    {
                        proc.Kill();
                        startDetached(path, null);
                    }
                    catch
                    {
                        endInstallation("Uninjected successfully. Failed to restart Discord; do this manually.", false); return;
                    }
                }
            }
            else
            {
                try
                {
                    proc.Kill();
                    startDetached(path, null);
                }
                catch
                {
                    endInstallation("Uninjected successfully. Failed to restart Discord; do this manually.", false); return;
                }
            }
            endInstallation("Uninjected and cleaned up successfully.", false); return;
        }

        private Process startDetached(string executablePath, string args)
        {
            if (platform == "Windows")
            {
                return Process.Start("cmd.exe", "/c start " + executablePath + (args == null ? "" : " " + args));
            }
            return Process.Start(executablePath, (args == null ? "" : args + " ") + "&"); // should work on Mac and Linux
        }

        private void StatusCloseButton_Click(object sender, EventArgs e)
        {
            Close();
        }

        private void UninstallButton_Click(object sender, EventArgs e)
        {
            operation = "UNINSTALL";
            InstallButton_Click(sender, e);
        }

        private void OpenFolderButton_Click(object sender, EventArgs e)
        {
            if (platform == "Windows")
            {
                startDetached("", ".\\EnhancedDiscord");
            }
            else if (platform == "Mac")
            {
                startDetached("open", "./EnhancedDiscord");
            }
        }
    }
}
