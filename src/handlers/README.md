The /handlers/ directory is where I put basically the entire page (components + hooks). 
Doing so allows me to test the behavior/side effects in a unit test
rather than dealing with NextJS routing logic and such.
Tests in this directory are effectively integration tests. 

A quick search indicated that a more complex testing setup would be required 
to cover the pages hooks (side effects) and I don't feel like doing that. 
This might not be the right way of doing this but I'll iterate from here.

I'll split logic from the handler into components when I realize I'll need to reuse them. 
