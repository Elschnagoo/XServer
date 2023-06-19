#!/command/with-contenv sh

awk -v r=$REACT_C_NAME '{sub(/!REPLACE!/,r)}1'  /app/public/ui/index.html >  /app/public/ui/parsed.html
mv /app/public/ui/parsed.html /app/public/ui/index.html

npm run start
