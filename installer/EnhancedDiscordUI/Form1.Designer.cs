namespace EnhancedDiscordUI
{
    partial class EDInstaller
    {
        /// <summary>
        /// Required designer variable.
        /// </summary>
        private System.ComponentModel.IContainer components = null;

        /// <summary>
        /// Clean up any resources being used.
        /// </summary>
        /// <param name="disposing">true if managed resources should be disposed; otherwise, false.</param>
        protected override void Dispose(bool disposing)
        {
            if (disposing && (components != null))
            {
                components.Dispose();
            }
            base.Dispose(disposing);
        }

        #region Windows Form Designer generated code

        /// <summary>
        /// Required method for Designer support - do not modify
        /// the contents of this method with the code editor.
        /// </summary>
        private void InitializeComponent()
        {
            this.components = new System.ComponentModel.Container();
            System.ComponentModel.ComponentResourceManager resources = new System.ComponentModel.ComponentResourceManager(typeof(EDInstaller));
            this.InstallButton = new System.Windows.Forms.Button();
            this.Title = new System.Windows.Forms.Label();
            this.UninstallButton = new System.Windows.Forms.Button();
            this.UpdateButton = new System.Windows.Forms.Button();
            this.InstallProgress = new System.Windows.Forms.ProgressBar();
            this.StatusLabel2 = new System.Windows.Forms.Label();
            this.StatusLabel = new System.Windows.Forms.Label();
            this.StatusCloseButton = new System.Windows.Forms.Button();
            this.StatusText = new System.Windows.Forms.TextBox();
            this.toolTip1 = new System.Windows.Forms.ToolTip(this.components);
            this.DevButton = new System.Windows.Forms.Button();
            this.CanaryButton = new System.Windows.Forms.Button();
            this.PTBButton = new System.Windows.Forms.Button();
            this.StableButton = new System.Windows.Forms.Button();
            this.ReinjectButton = new System.Windows.Forms.Button();
            this.pictureBox1 = new System.Windows.Forms.PictureBox();
            this.OpenFolderButton = new System.Windows.Forms.Button();
            this.BetaRadio = new System.Windows.Forms.RadioButton();
            ((System.ComponentModel.ISupportInitialize)(this.pictureBox1)).BeginInit();
            this.SuspendLayout();
            // 
            // InstallButton
            // 
            this.InstallButton.Anchor = System.Windows.Forms.AnchorStyles.Top;
            this.InstallButton.FlatStyle = System.Windows.Forms.FlatStyle.Flat;
            this.InstallButton.Font = new System.Drawing.Font("Segoe UI", 7.8F, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
            this.InstallButton.ForeColor = System.Drawing.Color.WhiteSmoke;
            this.InstallButton.Location = new System.Drawing.Point(155, 127);
            this.InstallButton.Margin = new System.Windows.Forms.Padding(3, 2, 3, 2);
            this.InstallButton.Name = "InstallButton";
            this.InstallButton.Size = new System.Drawing.Size(131, 30);
            this.InstallButton.TabIndex = 0;
            this.InstallButton.Text = "Install";
            this.toolTip1.SetToolTip(this.InstallButton, "Downloads and injects ED into your Discord client.");
            this.InstallButton.UseVisualStyleBackColor = true;
            this.InstallButton.Click += new System.EventHandler(this.InstallButton_Click);
            // 
            // Title
            // 
            this.Title.AutoSize = true;
            this.Title.Font = new System.Drawing.Font("Segoe UI Semibold", 18F, System.Drawing.FontStyle.Bold, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
            this.Title.ForeColor = System.Drawing.Color.WhiteSmoke;
            this.Title.Location = new System.Drawing.Point(131, 11);
            this.Title.Name = "Title";
            this.Title.Size = new System.Drawing.Size(255, 41);
            this.Title.TabIndex = 1;
            this.Title.Text = "EnhancedDiscord";
            // 
            // UninstallButton
            // 
            this.UninstallButton.Anchor = System.Windows.Forms.AnchorStyles.Top;
            this.UninstallButton.Enabled = false;
            this.UninstallButton.FlatAppearance.BorderColor = System.Drawing.Color.WhiteSmoke;
            this.UninstallButton.FlatStyle = System.Windows.Forms.FlatStyle.Flat;
            this.UninstallButton.Font = new System.Drawing.Font("Segoe UI", 7.8F, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
            this.UninstallButton.ForeColor = System.Drawing.Color.WhiteSmoke;
            this.UninstallButton.Location = new System.Drawing.Point(155, 162);
            this.UninstallButton.Margin = new System.Windows.Forms.Padding(3, 2, 3, 2);
            this.UninstallButton.Name = "UninstallButton";
            this.UninstallButton.Size = new System.Drawing.Size(131, 30);
            this.UninstallButton.TabIndex = 2;
            this.UninstallButton.Text = "Uninstall";
            this.toolTip1.SetToolTip(this.UninstallButton, "Uninjects ED and prompts you to delete ED\'s files.");
            this.UninstallButton.UseVisualStyleBackColor = true;
            this.UninstallButton.Click += new System.EventHandler(this.UninstallButton_Click);
            // 
            // UpdateButton
            // 
            this.UpdateButton.Anchor = System.Windows.Forms.AnchorStyles.Top;
            this.UpdateButton.Enabled = false;
            this.UpdateButton.FlatStyle = System.Windows.Forms.FlatStyle.Flat;
            this.UpdateButton.Font = new System.Drawing.Font("Segoe UI", 7.8F, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
            this.UpdateButton.ForeColor = System.Drawing.Color.WhiteSmoke;
            this.UpdateButton.Location = new System.Drawing.Point(87, 197);
            this.UpdateButton.Margin = new System.Windows.Forms.Padding(3, 2, 3, 2);
            this.UpdateButton.Name = "UpdateButton";
            this.UpdateButton.Size = new System.Drawing.Size(131, 30);
            this.UpdateButton.TabIndex = 3;
            this.UpdateButton.Text = "Update";
            this.toolTip1.SetToolTip(this.UpdateButton, "Replaces the ED files with the most recent ones.");
            this.UpdateButton.UseVisualStyleBackColor = true;
            this.UpdateButton.Click += new System.EventHandler(this.UpdateButton_Click);
            // 
            // InstallProgress
            // 
            this.InstallProgress.Location = new System.Drawing.Point(12, 218);
            this.InstallProgress.Margin = new System.Windows.Forms.Padding(3, 2, 3, 2);
            this.InstallProgress.Name = "InstallProgress";
            this.InstallProgress.Size = new System.Drawing.Size(415, 23);
            this.InstallProgress.Style = System.Windows.Forms.ProgressBarStyle.Continuous;
            this.InstallProgress.TabIndex = 5;
            this.InstallProgress.Visible = false;
            // 
            // StatusLabel2
            // 
            this.StatusLabel2.AutoSize = true;
            this.StatusLabel2.Font = new System.Drawing.Font("Segoe UI", 7.8F, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
            this.StatusLabel2.ForeColor = System.Drawing.Color.WhiteSmoke;
            this.StatusLabel2.Location = new System.Drawing.Point(9, 190);
            this.StatusLabel2.Name = "StatusLabel2";
            this.StatusLabel2.Size = new System.Drawing.Size(89, 19);
            this.StatusLabel2.TabIndex = 8;
            this.StatusLabel2.Text = "Lorem ipsum";
            this.StatusLabel2.Visible = false;
            // 
            // StatusLabel
            // 
            this.StatusLabel.AutoSize = true;
            this.StatusLabel.Font = new System.Drawing.Font("Segoe UI", 12F, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
            this.StatusLabel.ForeColor = System.Drawing.Color.WhiteSmoke;
            this.StatusLabel.Location = new System.Drawing.Point(8, 167);
            this.StatusLabel.Name = "StatusLabel";
            this.StatusLabel.Size = new System.Drawing.Size(165, 28);
            this.StatusLabel.TabIndex = 9;
            this.StatusLabel.Text = "Installation failed.";
            this.StatusLabel.Visible = false;
            // 
            // StatusCloseButton
            // 
            this.StatusCloseButton.FlatStyle = System.Windows.Forms.FlatStyle.Flat;
            this.StatusCloseButton.Font = new System.Drawing.Font("Segoe UI", 7.8F, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
            this.StatusCloseButton.ForeColor = System.Drawing.Color.WhiteSmoke;
            this.StatusCloseButton.Location = new System.Drawing.Point(251, 128);
            this.StatusCloseButton.Margin = new System.Windows.Forms.Padding(3, 2, 3, 2);
            this.StatusCloseButton.Name = "StatusCloseButton";
            this.StatusCloseButton.Size = new System.Drawing.Size(64, 30);
            this.StatusCloseButton.TabIndex = 10;
            this.StatusCloseButton.Text = "Close";
            this.StatusCloseButton.UseVisualStyleBackColor = true;
            this.StatusCloseButton.Visible = false;
            this.StatusCloseButton.Click += new System.EventHandler(this.StatusCloseButton_Click);
            // 
            // StatusText
            // 
            this.StatusText.BackColor = System.Drawing.Color.FromArgb(((int)(((byte)(31)))), ((int)(((byte)(36)))), ((int)(((byte)(36)))));
            this.StatusText.BorderStyle = System.Windows.Forms.BorderStyle.None;
            this.StatusText.Font = new System.Drawing.Font("Segoe UI", 10.2F, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
            this.StatusText.ForeColor = System.Drawing.Color.WhiteSmoke;
            this.StatusText.Location = new System.Drawing.Point(11, 68);
            this.StatusText.Margin = new System.Windows.Forms.Padding(3, 2, 3, 2);
            this.StatusText.Multiline = true;
            this.StatusText.Name = "StatusText";
            this.StatusText.ReadOnly = true;
            this.StatusText.Size = new System.Drawing.Size(416, 26);
            this.StatusText.TabIndex = 11;
            this.StatusText.Text = "Make sure to launch Discord before installing!";
            this.StatusText.TextAlign = System.Windows.Forms.HorizontalAlignment.Center;
            // 
            // DevButton
            // 
            this.DevButton.Anchor = System.Windows.Forms.AnchorStyles.Top;
            this.DevButton.FlatAppearance.BorderSize = 2;
            this.DevButton.FlatStyle = System.Windows.Forms.FlatStyle.Flat;
            this.DevButton.Font = new System.Drawing.Font("Segoe UI", 7.8F, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
            this.DevButton.ForeColor = System.Drawing.Color.White;
            this.DevButton.Image = global::EnhancedDiscordUI.Properties.Resources.discord_dev_64;
            this.DevButton.ImageAlign = System.Drawing.ContentAlignment.TopCenter;
            this.DevButton.Location = new System.Drawing.Point(320, 98);
            this.DevButton.Margin = new System.Windows.Forms.Padding(3, 2, 3, 2);
            this.DevButton.Name = "DevButton";
            this.DevButton.RightToLeft = System.Windows.Forms.RightToLeft.Yes;
            this.DevButton.Size = new System.Drawing.Size(91, 110);
            this.DevButton.TabIndex = 15;
            this.DevButton.Text = "Dev";
            this.DevButton.TextAlign = System.Drawing.ContentAlignment.BottomCenter;
            this.toolTip1.SetToolTip(this.DevButton, "Discord Development (aka Local.)");
            this.DevButton.UseVisualStyleBackColor = true;
            this.DevButton.Visible = false;
            this.DevButton.Click += new System.EventHandler(this.DevButton_Click);
            // 
            // CanaryButton
            // 
            this.CanaryButton.Anchor = System.Windows.Forms.AnchorStyles.Top;
            this.CanaryButton.FlatAppearance.BorderSize = 2;
            this.CanaryButton.FlatStyle = System.Windows.Forms.FlatStyle.Flat;
            this.CanaryButton.Font = new System.Drawing.Font("Segoe UI", 7.8F, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
            this.CanaryButton.ForeColor = System.Drawing.Color.Gold;
            this.CanaryButton.Image = global::EnhancedDiscordUI.Properties.Resources.discord_canary_64;
            this.CanaryButton.ImageAlign = System.Drawing.ContentAlignment.TopCenter;
            this.CanaryButton.Location = new System.Drawing.Point(224, 98);
            this.CanaryButton.Margin = new System.Windows.Forms.Padding(3, 2, 3, 2);
            this.CanaryButton.Name = "CanaryButton";
            this.CanaryButton.RightToLeft = System.Windows.Forms.RightToLeft.Yes;
            this.CanaryButton.Size = new System.Drawing.Size(91, 110);
            this.CanaryButton.TabIndex = 14;
            this.CanaryButton.Text = "Canary";
            this.CanaryButton.TextAlign = System.Drawing.ContentAlignment.BottomCenter;
            this.toolTip1.SetToolTip(this.CanaryButton, "Discord Canary");
            this.CanaryButton.UseVisualStyleBackColor = true;
            this.CanaryButton.Visible = false;
            this.CanaryButton.Click += new System.EventHandler(this.CanaryButton_Click);
            // 
            // PTBButton
            // 
            this.PTBButton.Anchor = System.Windows.Forms.AnchorStyles.Top;
            this.PTBButton.FlatAppearance.BorderSize = 2;
            this.PTBButton.FlatStyle = System.Windows.Forms.FlatStyle.Flat;
            this.PTBButton.Font = new System.Drawing.Font("Segoe UI", 7.8F, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
            this.PTBButton.ForeColor = System.Drawing.Color.SteelBlue;
            this.PTBButton.Image = global::EnhancedDiscordUI.Properties.Resources.discord_stable_64;
            this.PTBButton.ImageAlign = System.Drawing.ContentAlignment.TopCenter;
            this.PTBButton.Location = new System.Drawing.Point(128, 98);
            this.PTBButton.Margin = new System.Windows.Forms.Padding(3, 2, 3, 2);
            this.PTBButton.Name = "PTBButton";
            this.PTBButton.RightToLeft = System.Windows.Forms.RightToLeft.Yes;
            this.PTBButton.Size = new System.Drawing.Size(91, 110);
            this.PTBButton.TabIndex = 13;
            this.PTBButton.Text = "PTB";
            this.PTBButton.TextAlign = System.Drawing.ContentAlignment.BottomCenter;
            this.toolTip1.SetToolTip(this.PTBButton, "Discord PTB (Public Test Build)");
            this.PTBButton.UseVisualStyleBackColor = true;
            this.PTBButton.Visible = false;
            this.PTBButton.Click += new System.EventHandler(this.PTBButton_Click);
            // 
            // StableButton
            // 
            this.StableButton.Anchor = System.Windows.Forms.AnchorStyles.Top;
            this.StableButton.FlatAppearance.BorderSize = 2;
            this.StableButton.FlatStyle = System.Windows.Forms.FlatStyle.Flat;
            this.StableButton.Font = new System.Drawing.Font("Segoe UI", 7.8F, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
            this.StableButton.ForeColor = System.Drawing.Color.SteelBlue;
            this.StableButton.Image = global::EnhancedDiscordUI.Properties.Resources.discord_stable_64;
            this.StableButton.ImageAlign = System.Drawing.ContentAlignment.TopCenter;
            this.StableButton.Location = new System.Drawing.Point(32, 98);
            this.StableButton.Margin = new System.Windows.Forms.Padding(3, 2, 3, 2);
            this.StableButton.Name = "StableButton";
            this.StableButton.RightToLeft = System.Windows.Forms.RightToLeft.Yes;
            this.StableButton.Size = new System.Drawing.Size(91, 110);
            this.StableButton.TabIndex = 12;
            this.StableButton.Text = "Stable";
            this.StableButton.TextAlign = System.Drawing.ContentAlignment.BottomCenter;
            this.toolTip1.SetToolTip(this.StableButton, "Normal version of Discord.");
            this.StableButton.UseVisualStyleBackColor = true;
            this.StableButton.Visible = false;
            this.StableButton.Click += new System.EventHandler(this.StableButton_Click);
            // 
            // ReinjectButton
            // 
            this.ReinjectButton.Anchor = System.Windows.Forms.AnchorStyles.Top;
            this.ReinjectButton.Enabled = false;
            this.ReinjectButton.FlatStyle = System.Windows.Forms.FlatStyle.Flat;
            this.ReinjectButton.Font = new System.Drawing.Font("Segoe UI", 7.8F, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
            this.ReinjectButton.ForeColor = System.Drawing.Color.WhiteSmoke;
            this.ReinjectButton.Location = new System.Drawing.Point(225, 197);
            this.ReinjectButton.Margin = new System.Windows.Forms.Padding(3, 2, 3, 2);
            this.ReinjectButton.Name = "ReinjectButton";
            this.ReinjectButton.Size = new System.Drawing.Size(131, 30);
            this.ReinjectButton.TabIndex = 17;
            this.ReinjectButton.Text = "Reinject";
            this.toolTip1.SetToolTip(this.ReinjectButton, "Reinjects without changing your ED folder; useful after Discord updates.");
            this.ReinjectButton.UseVisualStyleBackColor = true;
            this.ReinjectButton.Click += new System.EventHandler(this.ReinjectButton_Click);
            // 
            // pictureBox1
            // 
            this.pictureBox1.Image = global::EnhancedDiscordUI.Properties.Resources.ed_og;
            this.pictureBox1.Location = new System.Drawing.Point(41, 12);
            this.pictureBox1.Margin = new System.Windows.Forms.Padding(3, 2, 3, 2);
            this.pictureBox1.Name = "pictureBox1";
            this.pictureBox1.Size = new System.Drawing.Size(87, 50);
            this.pictureBox1.SizeMode = System.Windows.Forms.PictureBoxSizeMode.StretchImage;
            this.pictureBox1.TabIndex = 4;
            this.pictureBox1.TabStop = false;
            // 
            // OpenFolderButton
            // 
            this.OpenFolderButton.FlatStyle = System.Windows.Forms.FlatStyle.Flat;
            this.OpenFolderButton.Font = new System.Drawing.Font("Segoe UI", 7.8F, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
            this.OpenFolderButton.ForeColor = System.Drawing.Color.WhiteSmoke;
            this.OpenFolderButton.Location = new System.Drawing.Point(113, 128);
            this.OpenFolderButton.Margin = new System.Windows.Forms.Padding(3, 2, 3, 2);
            this.OpenFolderButton.Name = "OpenFolderButton";
            this.OpenFolderButton.Size = new System.Drawing.Size(125, 30);
            this.OpenFolderButton.TabIndex = 16;
            this.OpenFolderButton.Text = "Open Folder";
            this.OpenFolderButton.UseVisualStyleBackColor = true;
            this.OpenFolderButton.Visible = false;
            this.OpenFolderButton.Click += new System.EventHandler(this.OpenFolderButton_Click);
            // 
            // BetaRadio
            // 
            this.BetaRadio.AutoSize = true;
            this.BetaRadio.Font = new System.Drawing.Font("Segoe UI", 10.2F, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
            this.BetaRadio.ForeColor = System.Drawing.SystemColors.ControlLightLight;
            this.BetaRadio.Location = new System.Drawing.Point(115, 95);
            this.BetaRadio.Name = "BetaRadio";
            this.BetaRadio.Size = new System.Drawing.Size(200, 27);
            this.BetaRadio.TabIndex = 18;
            this.BetaRadio.TabStop = true;
            this.BetaRadio.Text = "Opt-in to beta version";
            this.BetaRadio.UseVisualStyleBackColor = true;
            // 
            // EDInstaller
            // 
            this.AutoScaleDimensions = new System.Drawing.SizeF(8F, 16F);
            this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
            this.BackColor = System.Drawing.Color.FromArgb(((int)(((byte)(31)))), ((int)(((byte)(36)))), ((int)(((byte)(36)))));
            this.ClientSize = new System.Drawing.Size(439, 254);
            this.Controls.Add(this.BetaRadio);
            this.Controls.Add(this.ReinjectButton);
            this.Controls.Add(this.OpenFolderButton);
            this.Controls.Add(this.UninstallButton);
            this.Controls.Add(this.StatusCloseButton);
            this.Controls.Add(this.StatusLabel);
            this.Controls.Add(this.StatusLabel2);
            this.Controls.Add(this.InstallProgress);
            this.Controls.Add(this.pictureBox1);
            this.Controls.Add(this.UpdateButton);
            this.Controls.Add(this.Title);
            this.Controls.Add(this.InstallButton);
            this.Controls.Add(this.StatusText);
            this.Controls.Add(this.StableButton);
            this.Controls.Add(this.DevButton);
            this.Controls.Add(this.CanaryButton);
            this.Controls.Add(this.PTBButton);
            this.FormBorderStyle = System.Windows.Forms.FormBorderStyle.FixedSingle;
            this.Icon = ((System.Drawing.Icon)(resources.GetObject("$this.Icon")));
            this.Margin = new System.Windows.Forms.Padding(3, 2, 3, 2);
            this.Name = "EDInstaller";
            this.Text = "EnhancedDiscord Installer";
            ((System.ComponentModel.ISupportInitialize)(this.pictureBox1)).EndInit();
            this.ResumeLayout(false);
            this.PerformLayout();

        }

        #endregion

        private System.Windows.Forms.Button InstallButton;
        private System.Windows.Forms.Label Title;
        private System.Windows.Forms.Button UninstallButton;
        private System.Windows.Forms.Button UpdateButton;
        private System.Windows.Forms.PictureBox pictureBox1;
        private System.Windows.Forms.ProgressBar InstallProgress;
        private System.Windows.Forms.Label StatusLabel2;
        private System.Windows.Forms.Label StatusLabel;
        private System.Windows.Forms.Button StatusCloseButton;
        private System.Windows.Forms.TextBox StatusText;
        private System.Windows.Forms.ToolTip toolTip1;
        private System.Windows.Forms.Button StableButton;
        private System.Windows.Forms.Button PTBButton;
        private System.Windows.Forms.Button CanaryButton;
        private System.Windows.Forms.Button DevButton;
        private System.Windows.Forms.Button OpenFolderButton;
        private System.Windows.Forms.Button ReinjectButton;
        private System.Windows.Forms.RadioButton BetaRadio;
    }
}

