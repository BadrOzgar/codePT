import bot from './assets/bot.svg'
import user from './assets/user.svg'

const form = document.querySelector('form');
const chatContainer = document.querySelector('#chat_container')

let loadInterval;

//function to return 3 dots when bot thinking
function loader(element) {
    //empty at the start
    element.textContent = '';

    loadInterval = setInterval(()=> {
        element.textContent += '.';

        if (element.textContent === '....') {
            element.textContent = '';
        }
    }, 300)
}
//end of function

function typeText(element, text){
    let index = 0;

    let interval = setInterval(() => {
        if (index < text.length) {
            element.innerHTML += text.charAt(index); 
            index++;
        }else{
            clearInterval(interval);
        }
    }, 20);
}

//function for generate unique ID
function genUniqueId() {
    const timestamp =Date.now();
    const randomNumber = Math.random();
    const hexaNumber = randomNumber.toString(15);

    return `id-${timestamp}-${hexaNumber}`
}
//end function

//function for chat stripe
function chatStripe(isAI, value, uniqueId) {
    return(
        `
            <div class="wrapper ${isAI && 'ai'}">
                <div class="chat">
                    <div class="profile">
                        <img 
                            src="${isAI ? bot : user}"
                            alt="${isAI ? 'bot' : 'user'}"
                        />
                    </div>
                    <div class="message" id=${uniqueId}>${value}</div>
                </div>
            </div>
        `
    )
}
//end function 


//submit function for Ai Response
const handleSubmit = async (e) => {
    e.preventDefault();

    //getting data that typ into the form
    const data = new FormData(form);

    //user typeStrip
    chatContainer.innerHTML += chatStripe(false, data.get('prompt'));
    
    //clearing form area
    form.reset(); 
    
    //bot typeStripe
    const uniqueId = genUniqueId();
    chatContainer.innerHTML += chatStripe(true, " ", uniqueId);

    //scrolling down 
    chatContainer.scrollTop = chatContainer.scrollHeight

    //fetching newly created div
    const messageDev = document.getElementById(uniqueId)
    loader(messageDev)


    //fetching data from server (bot response)

    const response = await fetch('http://localhost:3030/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            prompt: data.get('prompt')
        })
    })


    clearInterval(loadInterval)
    messageDev.innerHTML = '';

    if (response.ok) {
        const data = await response.json();
        const presdata = data.bot.trim();

        typeText(messageDev, presdata)
    }else{
        const err = await response.text();
        messageDev.innerHTML = "Error happened";

        alert(err)
    }


}

form.addEventListener('submit', handleSubmit);
//when Enter Key pressed
form.addEventListener('keyup', (e)=>{
    if (e.keyCode === 13 ) {
        handleSubmit(e)
    }
});
