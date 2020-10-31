app.controller('indexController',['$scope','indexFactory',($scope,indexFactory)=>{
    $scope.messages = [];
    $scope.players = { };
    $scope.init = () => {
        const username = prompt("Please enter username");
        if(username)
            initSocket(username);
        else
            return false;
    };
    function initSocket(username)
    {
        const connectionOptions = {
            reconnectionAttempts:3,
            reconnectionDelay:600
        };
        indexFactory.connectSocket("http://localhost:3000",connectionOptions)
        .then((socket)=>{
            socket.emit('newUser',{username});

            socket.on('newUser',(data)=> {
                const messageData = {
                    type:{
                        code:0, //server or user message
                        message:1 //login or disconnect message
                    },//info
                    username:data.username
                };
                $scope.messages.push(messageData);
                $scope.players[data.id] = data;
                $scope.$apply();
            });

            socket.on('disUser',(data)=>{
                const messageData = {
                    type:{
                        code:0,
                        message:0
                    },//info
                    username:data.username
                };
                $scope.messages.push(messageData);
                delete $scope.players[data.id];
                $scope.$apply();
                console.log("ayrılma gerçekleşti",socket);
            });

            socket.on('initPlayers',(players)=>
            {
                $scope.players = players;
                $scope.$apply();
            });
            let animate = false;

            socket.on('animate',(data)=>{
                animate=true;
                    $('#' + data.socketId).animate({'left':data.x,'top' :data.y},()=>{
                        animate=false;
                    });
            })

            $scope.onClickPlayer = ($event) => {
                if(!animate){
                    let x = $event.offsetX;
                    let y = $event.offsetY;
                    socket.emit('animate',{x,y});
                    animate=true;
                    $('#' + socket.id).animate({'left':x,'top' :y},()=>{
                        animate=false;
                    });
                }
            }

            $scope.newMessage = () => {
                let message = $scope.message;
                console.log(message);
                const messageData = {
                    type:{
                        code:1, //server or user message
                    },
                    username: username,
                    text:message
                };
                $scope.messages.push(messageData);
                $scope.message = "";
            }
        }).catch((err)=>{
            console.log(err);
        });
    }
    
}])