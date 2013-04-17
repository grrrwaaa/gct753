local ffi = require "ffi"

ffi.cdef [[

int  kqueue(void);
int  kevent(int kq, const struct kevent *changelist, int nchanges, struct kevent *eventlist, int nevents, const struct timespec *timeout);
int kevent64(int kq, const struct kevent64_s *changelist, int nchanges, struct kevent64_s *eventlist,
int nevents, unsigned int flags, const struct timespec *timeout); 

//EV_SET(&kev, ident, filter, flags, fflags, data, udata);
//EV_SET64(&kev, ident, filter, flags, fflags, data, udata, ext[_], ext[1]);
]]

local kqueue = {}


return kqueue