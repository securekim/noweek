
CN=$1

function createSelfSign(){
    #Create Fridge KEY (SERVER)
    openssl genrsa -out $CN.key 4096
    #Create Fridge Certificate
    openssl req -new -key $CN.key -nodes -subj "/C=KR/O=noweek, Inc./OU=www.securekim.com/OU=(c) 2018 Entrust, Inc./CN="$CN -out $CN.csr
    #Self Sign Certificate
    openssl x509 -req -days 3650 -in $CN.csr -signkey $CN.key -out $CN.crt
}
createSelfSign

#Create Client KEY

#Create Client Certificate

#Self Sign Certificate
