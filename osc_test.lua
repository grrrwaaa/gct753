local osc = require "osc"

-- sender:
local s = osc.Send("localhost", 10001) -- hostname or IP address, port no.
print(s)
print(s:port(), s:ip(), s:host())

-- send a message:
s:send("/foo", 1, 2.2, "three")