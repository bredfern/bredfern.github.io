+++
title = "Linux Low Latency Audio"
date = 2024-09-24
+++

Over time its become a lot easier to setup Linux for pro audio uses.

Now in a few short steps we can rapidly modify any modern Linux system for pro audio.

Rather than compiling a realtime kernel, today we can setup PAM to enable high quality,
low latency audio.

To begin with we're going to check how the power management is working. These days you're not
going to need to change any settings as long as this command line call shows "performance" as
the result when your laptop is plugged in.

echo -n performance | sudo tee /sys/devices/system/cpu/cpu*/cpufreq/scaling_governor

Next we have to configure PAM for it to give us low latency audio.

Open up this file under your favorite text editor using sudo:
/etc/security/limits.conf or /etc/security/limits.d/audio.conf

Then paste this in:
@audio - rtprio 90       # maximum realtime priority
@audio - memlock unlimited  # maximum locked-in-memory address space (KB)

This enables PAM, now we'll make another couple small tweaks and we'll be ready to
reboot into low latency.

Next we add a setting to /etc/sysctl.conf most likely this file will be empty and we
will add:
vm.swappiness = 10

This is especially important for users of lower end hardware, where swap has a bigger
impact on latency.

For our final setting we need to add our user we intend to use for pro audio to the
audio group:

sudo usermod -a -G audio <username>
Where <username> is the username of your pro audio user.

To add yourself (where you're the only user) you can run this:
sudo usermod -a -G audio $USER

And that's it, reboot and you'll have great audio performance and quality, no need for tricky
custom kernels.
