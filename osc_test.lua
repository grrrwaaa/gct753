local osc = require "osc"

-- sender:
local s = osc.Send("localhost", 10001) -- hostname or IP address, port no.
print(s)
print(s:port(), s:ip(), s:host())

-- send a message:
s:send("/foo", 1, 2.2, "three")



-- receiver:
local r = osc.Recv(10002)

function update()
	for msg in r:recv() do
		print(msg.addr, #msg)
		local freq = msg[1]
		print(freq)
	end	
	
	
	
end
