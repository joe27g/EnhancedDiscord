using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Diagnostics;
using System.IO;
using System.Net;
using System.IO.Compression;

namespace EnhancedDiscord
{
    class Program
    {
        static void Main(string[] args)
        {
            MainAsync().Wait();
        }
        static void endInstallation(string reason, bool failed)
        {
            Console.WriteLine(reason);
            Console.WriteLine("Installation " + (failed ? "failed." : "completed!") + " Press any key to continue... ");
            Console.ReadKey();
            return;
        }
        static Process startDetached(string executablePath, string platform)
        {
            if (platform == "Windows")
            {
                return Process.Start("cmd.exe", "/c start " + executablePath);
            }
            return Process.Start(executablePath, "&"); // should work on Mac and Linux
        }
        static async Task MainAsync()
        {
            Console.WriteLine("EnhancedDiscord Installer v1.0");
            Console.WriteLine("--------------------------------------------------------------------------------------------");
            Console.WriteLine();
            Console.WriteLine("Finding Discord processes...");

            Process[] stable = Process.GetProcessesByName("Discord");
            Process[] canary = Process.GetProcessesByName("DiscordCanary");
            Process[] ptb = Process.GetProcessesByName("DiscordPtb");
            Process[] dev = Process.GetProcessesByName("DiscordDevelopment");
            Console.WriteLine("Found: " + stable.Length + " Stable | " + canary.Length + " Canary | " + ptb.Length + " PTB | " + dev.Length + " Development");

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
            Console.WriteLine("Found " + discordProcesses.Count + " Discord processes. " + uniqueProcesses.Count + " were unique.");
            int index = -1;
            if (uniqueProcesses.Count > 1)
            {
                // List all processes and wait for selection
                for (int i = 0; i < uniqueProcesses.Count; i++)
                {
                    string pName = "Discord";
                    if (canary.Contains(uniqueProcesses[i]))
                    {
                        pName += " Canary";
                    }
                    else if (ptb.Contains(uniqueProcesses[i]))
                    {
                        pName += " PTB";
                    }
                    else if (dev.Contains(uniqueProcesses[i]))
                    {
                        pName += " Development";
                    }
                    Console.WriteLine((i + 1) + ". " + pName + " | " + uniqueProcesses[i].MainWindowTitle.Replace(" - Discord", "") + " | PID: " + uniqueProcesses[i].Id + " | Path: " + uniqueProcesses[i].MainModule.FileName);
                }
                Console.Write("Choose the Discord process you would like to install to [1-" + uniqueProcesses.Count + "]: ");
                Console.WriteLine();

                string indexStr = Console.ReadLine();
                try
                {
                    index = Int32.Parse(indexStr);
                    index--;
                }
                catch
                {
                    endInstallation("Invalid index.", true); return;
                }
                if (index < 0 || index >= uniqueProcesses.Count)
                {
                    endInstallation("Invalid index. Must be between 1 and " + uniqueProcesses.Count + ".", true); return;
                }
            }
            else
            {
                index = 0;
            }
            Process dis = uniqueProcesses[index];
            string channel = "discord";
            if (canary.Contains(dis))
            {
                channel = "discordcanary";
            }
            else if (ptb.Contains(dis))
            {
                channel = "discordptb";
            }
            else if (dev.Contains(dis))
            {
                channel = "discorddevelopment";
            }
            Console.WriteLine("You chose: " + dis.MainWindowTitle);
            string path = dis.MainModule.FileName;
            string dLocation = Path.GetDirectoryName(path);
            Console.WriteLine("Your Discord install dir is: " + dLocation);

            string platform = "Windows";
            int platID = (int)Environment.OSVersion.Platform;
            if (platID == 6)
            {
                platform = "Mac";
            }
            else if (platID == 4 || platID == 128)
            {
                platform = "Linux";
            }
            Console.WriteLine("Your platform is: " + platform + " | Your Discord release channel is: " + channel);

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
            
            Console.WriteLine("File to hijack: " + targetPath);
            Console.WriteLine();

            if (!File.Exists(targetPath))
            {
                endInstallation("Could not find injection file.", true);
            }
            string currentContents = File.ReadAllText(targetPath);

            // now ask whether to install, uninstall, or update
            Console.WriteLine("1. Install");
            Console.WriteLine("2. Uninstall");
            Console.WriteLine("3. Update [coming soon]");
            Console.WriteLine("Choose an operation [1-3], or just hit Enter to install:");
            string opChoice = Console.ReadLine();
            if (opChoice == "3")
            {
                endInstallation("Are you blind or just stupid? I said COMING SOON.", true); return;
            }
            else if (opChoice == "2")
            {
                try
                {
                    File.WriteAllText(targetPath, "module.exports = require('./core.asar');");
                }
                catch
                {
                    endInstallation("Failed to write to injection file.", true); return;
                }
                if (Directory.Exists("./EnhancedDiscord"))
                {
                    Console.WriteLine("Would you like to keep your EnhancedDiscord folder? [y/n]");
                    string keepFolder = Console.ReadLine();
                    if (keepFolder.StartsWith("n"))
                    {
                        bool success = true;
                        Console.WriteLine("Killing Discord process...");
                        try
                        {
                            dis.Kill();
                        }
                        catch
                        {
                            success = false;
                            Console.WriteLine("Failed to kill Discord process. Aborted deletion of ED directory.");
                        }
                        if (success)
                        {
                            try
                            {
                                Directory.Delete("./EnhancedDiscord");
                            }
                            catch
                            {
                                Console.WriteLine("Failed to delete EnhancedDiscord directory.");
                            }
                            try
                            {
                                startDetached(path, platform);
                            }
                            catch
                            {
                                Console.WriteLine("Failed to restart Discord. Please launch it manually.");
                            }
                        }
                    }
                    else
                    {
                        try
                        {
                            dis.Kill();
                            startDetached(path, platform);
                        }
                        catch
                        {
                            Console.WriteLine("Failed to restart Discord. Exit the app completely and restart it to see changes.");
                        }
                    }
                }
                else
                {
                    try
                    {
                        dis.Kill();
                        startDetached(path, platform);
                    }
                    catch
                    {
                        Console.WriteLine("Failed to restart Discord. Exit the app completely and restart it to see changes.");
                    }
                }
                endInstallation("Uninstallation complete.", false);
                return;
            }

            if (currentContents != "module.exports = require('./core.asar');")
            {
                Console.WriteLine("EnhancedDiscord was already injected. Reinjecting...");
            }
            string stuffToInject = File.ReadAllText("./shit_to_inject.js");
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
                endInstallation("Failed to write to injection file: " + targetPath, true); return;
            }
            
            Console.WriteLine();
            Console.WriteLine("Successfully injected. Downloading ED...");
            // https://github.com/joe27g/EnhancedDiscord/archive/master.zip

            string zipLink = "https://codeload.github.com/joe27g/EnhancedDiscord/zip/master";

            WebClient wc = new WebClient();
            try
            {
                await wc.DownloadFileTaskAsync(new Uri(zipLink), "./ED_master.zip");
            }
            catch
            {
                endInstallation("Failed to download ED files. Perhaps check your firewall.", true); return;
            }

            Console.WriteLine("Finished downloading! Extracting now...");
            if (Directory.Exists("./EnhancedDiscord") || Directory.Exists("./EnhancedDiscord-master"))
            {
                Console.WriteLine();
                Console.WriteLine("EnhancedDiscord folder already exists. Do you want to overwrite it? [y/n]");
                string reply = "";
                try
                {
                    reply = Console.ReadLine();
                }
                catch
                {
                    endInstallation("Invalid input.", true); return;
                }
                if (!reply.StartsWith("y"))
                {
                    endInstallation("Not replacing old ED files.", false); return;
                }
                try
                {
                    if (Directory.Exists("./EnhancedDiscord"))
                    {
                        Directory.Delete("./EnhancedDiscord", true);
                    }
                    if (Directory.Exists("./EnhancedDiscord-master"))
                    {
                        Directory.Delete("./EnhancedDiscord-master", true);
                    }
                }
                catch
                {
                    Console.WriteLine("Error deleting old folders.");
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
            Console.WriteLine("Finished extracting zip. Cleaning up...");
            try
            {
                Directory.Move("./EnhancedDiscord-master", "./EnhancedDiscord");
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
                        Console.WriteLine("Failed to delete " + filePath);
                    }
                }
            }
            if (!File.Exists("./EnhancedDiscord/config.json"))
            {
                try
                {
                    File.WriteAllText("./EnhancedDiscord/config.json", "{}");
                }
                catch
                {
                    Console.WriteLine("Failed to create config.json. You will need to create this and set the contents to \"{ }\".");
                }
            }
            Console.WriteLine("Relaunching Discord...");
            try
            {
                dis.Kill();
                startDetached(path, platform);
            }
            catch
            {
                Console.WriteLine("Failed to restart Discord. Exit the app completely and restart it to see changes.");
            }
            endInstallation("Finished cleaning up.", false);
            return;
        }
    }
}
