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
        private string branch = "master";

        public EDInstaller()
        {
            Logger.MakeDivider();
            Logger.Log("Starting...");
            InitializeComponent();
            if (Directory.Exists("./EnhancedDiscord"))
            {
                UninstallButton.Enabled = true;
                UpdateButton.Enabled = true;
                ReinjectButton.Enabled = true;
            }
        }
        private void endInstallation(string reason, bool failed)
        {
            InstallProgress.Value = 100;
            BetaRadio.Hide();
            InstallButton.Hide();
            UninstallButton.Hide();
            UpdateButton.Hide();
            ReinjectButton.Hide();
            StatusText.Hide();
            StatusLabel.Show();
            StatusLabel.Text = operation == "UPDATE" ? "Update " + (failed ? "failed" : "complete") : (operation == "UNINSTALL" ? "Unin" : "In") + "stallation " + (failed ? " failed." : "completed!");
            StatusLabel.ForeColor = failed ? Color.Red : Color.Lime;
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
            if (BetaRadio.Checked)
            {
                branch = "beta";
            }
            BetaRadio.Hide();
            InstallButton.Hide();
            UninstallButton.Hide();
            UpdateButton.Hide();
            ReinjectButton.Hide();
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
            if (operation == "UPDATE")
            {
                continueUpdate(finalProcess);
            }
            else
            {
                continueInstall(finalProcess);
            }
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
            Logger.Log("Using release " + release);
            StableButton.Hide();
            PTBButton.Hide();
            CanaryButton.Hide();
            DevButton.Hide();

            StatusText.Text = "Injecting...";
            InstallProgress.Value = 20;
            Logger.Log(StatusText.Text);

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
            Logger.Log(StatusText.Text);

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
                Logger.Error("Could not fine injection file with basepath " + basePath);
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
                Logger.Log(StatusText.Text);
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
            catch (Exception e)
            {
                Logger.Error("Failed to write to injection file. " + e.Message);
                endInstallation("Failed to write to injection file.", true); return;
            }

            if (operation == "REINJECT")
            {
                try
                {
                    proc.Kill();
                    startDetached(path, null);
                    endInstallation("Successfully reinjected.", false);
                }
                catch (Exception e)
                {
                    Logger.Error("Failed to restart Discord; do this manually. " + e.Message);
                    endInstallation("Failed to restart Discord; do this manually.", false);
                }
                return;
            }

            InstallProgress.Value = 40;
            StatusText.Text = "Successfully injected. Downloading ED...";
            Logger.Log(StatusText.Text);

            ServicePointManager.SecurityProtocol = SecurityProtocolType.Tls | SecurityProtocolType.Tls11 | SecurityProtocolType.Tls12 | SecurityProtocolType.Ssl3;
            string zipLink = Properties.Resources.zipLink + branch;
            WebClient wc = new WebClient();
            try
            {
                await wc.DownloadFileTaskAsync(new Uri(zipLink), "./ED_master.zip");
            }
            catch (Exception e)
            {
                Logger.Error("Failed to download ED files. " + e.Message);
                endInstallation("Failed to download ED files.", true); return;
            }
            InstallProgress.Value = 60;
            StatusText.Text = "Successfully downloaded. Extracting...";
            Logger.Log(StatusText.Text);

            if (Directory.Exists("./EnhancedDiscord") || Directory.Exists("./EnhancedDiscord-" + branch))
            {
                DialogResult confirmResult = MessageBox.Show("ED folder already exists. Overwrite it?", "EnhancedDiscord - Confirm Overwrite", MessageBoxButtons.YesNo);
                if (confirmResult == DialogResult.No)
                {
                    Logger.Error("Not replacing old ED files; restart Discord manually.");
                    endInstallation("Not replacing old ED files; restart Discord manually.", false); return;
                }
                try
                {
                    if (Directory.Exists("./EnhancedDiscord"))
                    {
                        Directory.Delete("./EnhancedDiscord", true);
                    }
                    if (Directory.Exists("./EnhancedDiscord-" + branch))
                    {
                        Directory.Delete("./EnhancedDiscord-" + branch, true);
                    }
                }
                catch (Exception e)
                {
                    StatusText.Text = "Error deleting old folders.";
                    Logger.Error(StatusText.Text + " " + e.Message);
                }
            }
            try
            {
                ZipFile.ExtractToDirectory("./ED_master.zip", "./");
            }
            catch (Exception e)
            {
                Logger.Error("Failed to extract zip file. " + e.Message);
                endInstallation("Failed to extract zip file.", true); return;
            }
            InstallProgress.Value = 70;
            StatusText.Text = "Finished extracting zip. Cleaning up...";
            Logger.Log(StatusText.Text);
            try
            {
                Directory.Move("./EnhancedDiscord-" + branch, "./EnhancedDiscord");
            }
            catch (Exception e)
            {
                Logger.Error("Failed to rename extracted folder. " + e.Message);
                endInstallation("Failed to rename extracted folder.", true); return;
            }

            string[] garbage = new string[] { "./EnhancedDiscord/README.md", "./EnhancedDiscord/plugins.md", "./EnhancedDiscord/advanced_installation.md", "./EnhancedDiscord/.gitignore", "./ED_master.zip", "./EnhancedDiscord/installer", "./EnhancedDiscord/installer_cmdline" };

            foreach (string filePath in garbage)
            {
                try
                {
                    if (File.Exists(filePath))
                    {
                        File.Delete(filePath);
                    }
                    if (Directory.Exists(filePath))
                    {
                        Directory.Delete(filePath, true);
                    }
                }
                catch (Exception e)
                {
                    Logger.Error("Error during cleanup. " + e.Message);
                }
            }
            InstallProgress.Value = 80;
            StatusText.Text = "Finished cleaning up. Creating config.json...";
            Logger.Log(StatusText.Text);

            bool configSuccess = true;
            if (!File.Exists("./EnhancedDiscord/config.json"))
            {
                try
                {
                    File.WriteAllText("./EnhancedDiscord/config.json", "{}");
                }
                catch (Exception e)
                {
                    Logger.Error("Failed to write config.json. " + e.Message);
                    configSuccess = false;
                    //StatusText.Text = "Failed to create config.json.";

                }
            }

            InstallProgress.Value = 90;
            StatusText.Text = (configSuccess ? File.Exists("./EnhancedDiscord/config.json") ? "Found" : "Created" : "Failed to create") + " config.json. Relaunching Discord...";
            if (configSuccess) Logger.Log(StatusText.Text);
            else Logger.Error(StatusText.Text);
            try
            {
                proc.Kill();
                startDetached(path, null);
            }
            catch (Exception e)
            {
                StatusText.Text = "Failed to restart Discord; do this manually.";
                Logger.Error(StatusText.Text + " " + e.Message);
            }
            InstallProgress.Value = 100;
            endInstallation("Finished cleaning up.", false);
            return;
        }

        private void continueUninstall(Process proc, string targetPath, string platform)
        {
            StatusText.Text = "Uninstalling...";
            InstallProgress.Value = 30;
            Logger.Log(StatusText.Text);

            string path = proc.MainModule.FileName;
            try
            {
                File.WriteAllText(targetPath, "module.exports = require('./core.asar');");
            }
            catch (Exception e)
            {
                Logger.Error("Failed to write to injection file. " + e.Message);
                endInstallation("Failed to write to injection file.", true); return;
            }

            StatusText.Text = "Successfully uninjected. Deleting old files...";
            InstallProgress.Value = 60;
            Logger.Log(StatusText.Text);

            if (Directory.Exists("./EnhancedDiscord"))
            {
                DialogResult confirmResult = MessageBox.Show("Would you like to keep your EnhancedDiscord folder?", "EnhancedDiscord - Confirm Delete", MessageBoxButtons.YesNo);
                if (confirmResult == DialogResult.No)
                {
                    bool success = true;
                    StatusText.Text = "Killing Discord process...";
                    Logger.Log(StatusText.Text);
                    try
                    {
                        proc.Kill();
                    }
                    catch (Exception e)
                    {
                        success = false;
                        StatusText.Text = "Failed to kill Discord process. Aborted deletion of ED directory.";
                        Logger.Error(StatusText.Text + " " + e.Message);
                    }
                    if (success)
                    {
                        try
                        {
                            Directory.Delete("./EnhancedDiscord", true);
                            Directory.Delete("./EnhancedDiscord", false);
                        }
                        catch (Exception e)
                        {
                            StatusText.Text = "Failed to delete EnhancedDiscord directory.";
                            Logger.Error(StatusText.Text + " " + e.Message);
                        }
                        try
                        {
                            startDetached(path, null);
                        }
                        catch (Exception e)
                        {
                            Logger.Error("Uninjected successfully. Failed to restart Discord; do this manually. " + e.Message);
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
                    catch (Exception e)
                    {
                        Logger.Error("Uninjected successfully. Failed to restart Discord; do this manually. " + e.Message);
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
                catch (Exception e)
                {
                    Logger.Error("Uninjected successfully. Failed to restart Discord; do this manually. " + e.Message);
                    endInstallation("Uninjected successfully. Failed to restart Discord; do this manually.", false); return;
                }
            }
            Logger.Log("Uninjected and cleaned up successfully.");
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

        private void UpdateButton_Click(object sender, EventArgs e)
        {
            operation = "UPDATE";
            InstallButton_Click(sender, e);
        }
        private void ReinjectButton_Click(object sender, EventArgs e)
        {
            operation = "REINJECT";
            InstallButton_Click(sender, e);
        }

        async private void continueUpdate(Process proc)
        {
            string path = proc.MainModule.FileName;
            operation = "UPDATE";
            BetaRadio.Hide();
            InstallButton.Hide();
            UninstallButton.Hide();
            UpdateButton.Hide();
            ReinjectButton.Hide();
            StatusText.Show();
            InstallProgress.Show();
            InstallProgress.Value = 0;
       
            string tempPath = Path.Combine(Path.GetTempPath(), "EnhancedDiscord");
            if (Directory.Exists(tempPath))
            {
                try
                {
                    Directory.Delete(tempPath, true);
                }
                catch (Exception e)
                {
                    StatusText.Text = "Error deleting temp folders.";
                    Logger.Log(StatusText.Text + " " + e.Message);
                }
            }
            Directory.CreateDirectory(tempPath);

            StatusText.Text = "Downloading package...";
            Logger.Log(StatusText.Text);
            string zipPath = Path.Combine(tempPath, "EnhancedDiscord.zip");
            string zipLink = Properties.Resources.zipLink + branch;
            ServicePointManager.SecurityProtocol = SecurityProtocolType.Tls | SecurityProtocolType.Tls11 | SecurityProtocolType.Tls12 | SecurityProtocolType.Ssl3;
            WebClient wc = new WebClient();
            try
            {
                await wc.DownloadFileTaskAsync(new Uri(zipLink), zipPath);
            }
            catch (Exception e)
            {
                Logger.Error("Failed to download ED files. " + e.Message);
                endInstallation("Failed to download ED files.", true); return;
            }
            InstallProgress.Value = 40;
            StatusText.Text = "Successfully downloaded. Extracting...";
            Logger.Log(StatusText.Text);

            try
            {
                ZipFile.ExtractToDirectory(zipPath, tempPath);
            }
            catch (Exception e)
            {
                Logger.Error("Failed to extract zip file. " + e.Message);
                endInstallation("Failed to extract zip file.", true); return;
            }
            InstallProgress.Value = 50;
            StatusText.Text = "Finished extracting zip. Checking core...";
            Logger.Log(StatusText.Text);

            string extractedPath = Path.Combine(tempPath, "EnhancedDiscord-" + branch);
            string enhancedPath = "./EnhancedDiscord";

            if (!File.Exists(Path.Combine(enhancedPath, "config.json")))
            {
                try
                {
                    File.WriteAllText(Path.Combine(enhancedPath, "config.json"), "{}");
                }
                catch (Exception e)
                {
                    Logger.Error("Failed to write config.json. " + e.Message);
                }
            }

            string[] garbage = new string[] { "README.md", "plugins.md", ".gitignore", "advanced_installation.md" };
            foreach (string file in Directory.GetFiles(extractedPath))
            {
                string filename = Path.GetFileName(file);
                if (Array.Exists(garbage, f => f == filename)) continue;
                string equiv = Path.Combine(enhancedPath, filename);
                bool filesEqual = false;
                bool fileExists = File.Exists(equiv);
                if (fileExists) filesEqual = FilesEqual(file, equiv);
                try
                {
                    if (fileExists && !filesEqual) File.Delete(equiv);
                    if (!fileExists || !filesEqual) File.Copy(file, equiv);
                }
                catch (Exception e)
                {
                    StatusText.Text = "Could not update plugin: " + filename;
                    Logger.Log(StatusText.Text + " " + e.Message);
                }
            }
            InstallProgress.Value = 70;
            StatusText.Text = "Core finished. Checking plugins...";
            Logger.Log(StatusText.Text);

            string pluginPath = Path.Combine(enhancedPath, "plugins");
            if (!Directory.Exists(pluginPath)) Directory.CreateDirectory(pluginPath);
            foreach (string file in Directory.GetFiles(Path.Combine(extractedPath, "plugins")))
            {
                string filename = Path.GetFileName(file);
                if (filename == "style.css") continue;
                string equiv = Path.Combine(pluginPath, filename);
                bool filesEqual = false;
                bool fileExists = File.Exists(equiv);
                if (fileExists) filesEqual = FilesEqual(file, equiv);
                try
                {
                    if (fileExists && !filesEqual) File.Delete(equiv);
                    if (!fileExists || !filesEqual) File.Copy(file, equiv);
                }
                catch (Exception e)
                {
                    StatusText.Text = "Could not update plugin: " + filename;
                    Logger.Log(StatusText.Text + " " + e.Message);
                }
            }

            StatusText.Text = "Cleaning up...";
            Logger.Log(StatusText.Text);
            if (Directory.Exists(tempPath))
            {
                try
                {
                    Directory.Delete(tempPath, true);
                }
                catch (Exception e)
                {
                    StatusText.Text = "Error deleting temp folders.";
                    Logger.Log(StatusText.Text + " " + e.Message);
                }
            }
            InstallProgress.Value = 90;
            endInstallation("ED files updated.", false); return;
        }

        // Adapted from https://stackoverflow.com/questions/7931304/comparing-two-files-in-c-sharp
        private bool FilesEqual(string filename1, string filename2)
        {
            if (filename1 == filename2) return true;

            FileStream fileStream1 = new FileStream(filename1, FileMode.Open, FileAccess.Read);
            FileStream fileStream2 = new FileStream(filename2, FileMode.Open, FileAccess.Read);
            if (fileStream1.Length != fileStream2.Length)
            {
                fileStream1.Close();
                fileStream2.Close();
                return false;
            }

            int fileByte1;
            int fileByte2;
            do
            {
                fileByte1 = fileStream1.ReadByte();
                fileByte2 = fileStream2.ReadByte();
            }
            while ((fileByte1 == fileByte2) && (fileByte1 != -1));

            fileStream1.Close();
            fileStream2.Close();

            return ((fileByte1 - fileByte2) == 0);
        }
    }
}
