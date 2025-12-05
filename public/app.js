const API_BASE = 'http://localhost:3000';

// Load posts on page load
document.addEventListener('DOMContentLoaded', () => {
    new PostList();
    // loadPosts();
    // document.getElementById('add-post-form').addEventListener('submit', addPost);
});

class PostList {
    constructor() {
        this.loadPosts();
        document.getElementById('add-post-form')
            .addEventListener('submit', (event) => this.addPost(event) );
    }

    async loadPosts() {
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
            for (let post of posts) {
                post.id = id++;
                this.showPost(post);
            }
        } catch (error) {
            // Template opgezocht in de HTML
            const errorTemplate = document.querySelector("#post-error-template");
            // Clone gemaakt van de INHOUD van deze template
            const errorClone = errorTemplate.content.cloneNode(true);
            // <div class=error> opgezocht in de clone.
            const errorDiv = errorClone.querySelector(".error");
            // De tekstuele foutmelding toegevoegd aan de <div>
            errorDiv.innerHTML = `Fout bij laden van posts: ${error.message}`;

            postsList.replaceChildren(errorClone);
            console.error('Error loading posts:', error);
        }
    }

    showPost(post) {
        const postsList = document.getElementById('posts-list');
        const postTemplate = document.querySelector("#post-item-template");
        const postClone = postTemplate.content.cloneNode(true);
        const postLink = postClone.querySelector('.url a')

        postClone.querySelector('.title').innerHTML = post.name;
        postLink.innerHTML = post.url;
        postLink.href = post.url
        postClone.querySelector(".text").innerHTML = post.text;
        if (post.comments) {
            postClone.querySelector(".comments").innerHTML = `${post.comments.length} reacties`;
        }

        postsList.appendChild(postClone);
    }

    async addPost(event) {
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
            this.showMessage('Post succesvol toegevoegd!', 'success');

            // Show post
            showPost(post);
        } catch (error) {
            this.showMessage(`Fout bij toevoegen van post: ${error.message}`, 'error');
            console.error('Error adding post:', error);
        }
    }

    showMessage(message, type) {
        const messageDiv = document.createElement('div');
        messageDiv.className = type;
        messageDiv.textContent = message;
        document.querySelector('.container').insertBefore(messageDiv, document.querySelector('.section:first-child'));

        setTimeout(() => {
            messageDiv.remove();
        }, 3000);
    }
}