$param1=$args[0]
$param2=$args[1]

# pack install for electron
cd .\backend
npm $param1 $param2
cd ..

# pack install for electron
cd .\frontend
npm $param1 $param2
cd ..
