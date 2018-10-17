using System;
using System.IO;
using System.Reflection;

namespace EnhancedDiscordUI
{
    static public class Logger
    {
        static public void Log(string logMessage)
        {
            string m_exePath = Path.GetDirectoryName(Assembly.GetExecutingAssembly().Location);
            try
            {
                using (StreamWriter w = File.AppendText(m_exePath + "\\" + "log.txt"))
                {
                    _Log("INFO", logMessage, w);
                }
            }
            catch (Exception ex)
            {
            }
        }

        static public void Warn(string logMessage)
        {
            string m_exePath = Path.GetDirectoryName(Assembly.GetExecutingAssembly().Location);
            try
            {
                using (StreamWriter w = File.AppendText(m_exePath + "\\" + "log.txt"))
                {
                    _Log("WARN", logMessage, w);
                }
            }
            catch (Exception ex)
            {
            }
        }

        static public void Error(string logMessage)
        {
            string m_exePath = Path.GetDirectoryName(Assembly.GetExecutingAssembly().Location);
            try
            {
                using (StreamWriter w = File.AppendText(m_exePath + "\\" + "log.txt"))
                {
                    _Log("ERROR", logMessage, w);
                }
            }
            catch (Exception ex)
            {
            }
        }

        static public void _Log(string type, string logMessage, TextWriter txtWriter)
        {
            try
            {
                txtWriter.WriteLine("[{0}][{1} {2}]: {3}", type, DateTime.Now.ToLongTimeString(), DateTime.Now.ToLongDateString(), logMessage);
            }
            catch (Exception ex)
            {
            }
        }

        static public void MakeDivider()
        {
            string m_exePath = Path.GetDirectoryName(Assembly.GetExecutingAssembly().Location);
            try
            {
                using (StreamWriter w = File.AppendText(m_exePath + "\\" + "log.txt"))
                {
                    w.WriteLine("---------------------------------------------------------------------");
                }
                
            }
            catch (Exception ex)
            {
            }
        }
    }
}
