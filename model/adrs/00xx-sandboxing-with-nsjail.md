# NN. Use Linux Namespace Tooling for Sandboxing 
**Date:** 2025-06-NN
**Status:** Pending
**Summary**  
*In the context of* effectively sandboxing test processes, *facing* the challenge of *malicious and/or poorly written* user submissions *we decided* to utilise *Linux based tools* for sandboxing. This enables access to a *comprehensive ecosystem* of sandboxing tools *to help achieve* secure and efficient execution.


**Context**  
- Our system must support running potentially unsafe code without affecting the overall system.
- We need a secure approach to isolate the testing environment from all other resources:
-  Tests must be isolated from filesystem and network resources.
- Tests must not overly consume memory or take excessive amounts of time (draining cpu resources and reducing the systems availability).


**Decision**  
We decided to use the Linux based tooling as the ecosystem contains a number of tools (firejail, nsjail, bubblewrap) that are well-maintained and designed for sandboxing. In particular, we have decided to use nsjail which takes advantage of linux namespaces to provide a lightweight method of process isolation.
  
- nsjail will limit syscall access via an assigned configuration file.
- nsjail will limit filesystem access
- nsjail will isolate networking services denying access for submission code to access external networks.
  
The linux ecosystem also enables the usage of tooling such as ulimit and timeout to further time limit and memory limit processes.
  
Since this requires a linux system, we will disable sandboxing for local development via environment variables and only use/test sandboxing in deployed nodes.

**Consequences**
- Using external tooling increases the number of dependencies - failures or poorly maintained external tools can lead to increased security risks.
- Using tools dependent on the linux subsystem means sandboxing can only occur on linux systems. For this reason we can only deploy to Linux based instances.
- Testing sandboxing locally may not be possible without the use of a virtual machine.
- Updates to external tools which are not backwards compatible, or updates to the OS for which the tooling is not also updated could lead to failures on system upgrades.