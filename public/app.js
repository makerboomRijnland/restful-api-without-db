const API_BASE = 'http://localhost:3000';

// Load posts on page load
document.addEventListener('DOMContentLoaded', () => {
    loadPosts();
    document.getElementById('add-post-form').addEventListener('submit', addPost);
});

// Load and display posts
async function loadPosts() {
    const postsList = document.getElementById('posts-list');
    postsList.innerHTML = '<div class="loading">Posts laden...</div>';

    try {
        const response = await fetch(`${API_BASE}/posts`);
        const posts = await response.json();

        if (posts.length === 0) {
            postsList.innerHTML = '<p>Geen posts gevonden.</p>';
            return;
        }

        postsList.innerHTML = "";
        let id = 0;
        for(let post of posts) {
            post.id = id++; 
            showPost(post);
        }
    } catch (error) {
        const errorTemplate = document.querySelector("#error-template");
        const errorClone = errorTemplate.content.cloneNode(true);

        errorClone.querySelector(".error").innerHTML = `Fout bij laden van posts: ${error.message}`;
        postsList.replaceChildren(errorClone);

        // postsList.innerHTML = `<div class="error">Fout bij laden van posts: ${error.message}</div>`;
        console.error('Error loading posts:', error);
    }
}

function showPost(post) {
    const postsList = document.getElementById('posts-list');
    postsList.innerHTML += `
        <div class="post-item" data-id="${post.id}">
            <aside><button class="edit">&#x1F58B;</button><button class="delete">&#x1F5D1;</button></aside>
            <h3>${post.name}</h3>
            <p><a href="${post.url}" target="_blank">${post.url}</a></p>
            <p>${post.text}</p>
            ${post.comments ? `<p><em>${post.comments.length} reacties</em></p>` : ''}
        </div>
    `;
}

// Add new post
async function addPost(event) {
    event.preventDefault();

    const post = {
        name: document.getElementById('post-name').value,
        url: document.getElementById('post-url').value,
        text: document.getElementById('post-text').value
    };

    try {
        const response = await fetch(`${API_BASE}/posts`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(post)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        post.id = result.id;
        
        // Clear form
        document.getElementById('add-post-form').reset();
        
        // Show success message
        showMessage('Post succesvol toegevoegd!', 'success');
        
        // Show post
        showPost(post);
    } catch (error) {
        showMessage(`Fout bij toevoegen van post: ${error.message}`, 'error');
        console.error('Error adding post:', error);
    }
}

// Show message
function showMessage(message, type) {
    const messageDiv = document.createElement('div');
    messageDiv.className = type;
    messageDiv.textContent = message;
    document.querySelector('.container').insertBefore(messageDiv, document.querySelector('.section:first-child'));
    
    setTimeout(() => {
        messageDiv.remove();
    }, 3000);
}