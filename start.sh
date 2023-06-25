#!/bin/bash

echo -e '\n'
echo -e '	    _\ |_  )_  ) _ \ '
echo -e '	   __/ |  /   /  _\ \ Store'
echo -e '	   _| _|___|___|_/ \_\ \n\n'

cd backend && npm install > /dev/null 2>&1
cd .. && cd client && npm install -f > /dev/null 2>&1
npm run build > /dev/null 2>&1
cd ..
echo -e "$BLUE All dependencies installed. $N \n$LG Client build... $N \n$BLUE Client build completed. $N \n$GREEN Server starting..."
npm start