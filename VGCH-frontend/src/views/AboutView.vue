<script setup lang="ts">
import type { ContactRequest } from '@/model/MessageModels';
import { MessageHandler } from '@/Services/messagehandler';
import { reactive } from 'vue';

const messageHandler = new MessageHandler();
const form = reactive<ContactRequest>({
    name: '',
    email: '',
    message: '',
});

const errorMessage = reactive({ value: '' });
const isSuccess = reactive({ value: false });

const handleSubmit = async () => {
    errorMessage.value = '';
    isSuccess.value = false;

    const result = await messageHandler.createContactRequest(form);
    if (!result.success) {
        errorMessage.value = result.message;
        isSuccess.value = false;
    } else {
        errorMessage.value = 'Contact request received! Thank you.';
        isSuccess.value = true;
        setTimeout(() => location.reload(), 900);
    }
};
</script>

<template>
    <main>
        <div class="about">
            <h1>About</h1>
        </div>

        <div>
            <p class="pgSpace">
                Over the past 20 years, video game preservation has become an increasingly prevalent
                topic in the gaming community, and has been subject to increasing academic research.
                Still, more research has to be done into the best way to preserve consoles.
            </p>

            <p class="pgSpace">
                In my personal opinion, preservation is done best by preserving the means
                <i>to</i> preserve. This is why I have chosen to build an initiative that aims to
                preserve the <b>hardware</b> for consoles, by documenting them in the best way
                possible, using a standardized format. The website is driven by an ontology, which
                can also be found <RouterLink to="/download">here</RouterLink>.
            </p>

            <p class="pgSpace">
                Since the nature of most of this data only contains a loose structure, an ontology
                has been chosen. Community submissions and suggestions will be welcomed to make sure
                that this documentation resource will stay up to date.
            </p>

            <p class="pgSpace">
                Should you have any questions, please fill out the contact form below.
                If you want to make a submission, please go to the <RouterLink to="/submission">submissions</RouterLink> page.
            </p>

            <div class="background-box" style="margin-top: 10%; max-width: 800px">
                <h2 style="margin-bottom: 5%">Contact form</h2>
                <form class="contact-form" @submit.prevent="handleSubmit">
                    <div
                        v-if="errorMessage.value"
                        :class="isSuccess.value ? 'form-success' : 'form-error'"
                    >
                        {{ errorMessage.value }}
                    </div>
                    <div class="form-group">
                        <label for="name">Name:</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            v-model="form.name"
                            required
                            class="form-control"
                        />
                    </div>
                    <div class="form-group">
                        <label for="email">Email:</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            v-model="form.email"
                            required
                            class="form-control"
                        />
                    </div>
                    <div class="form-group">
                        <label for="message">Message:</label>
                        <textarea
                            id="message"
                            name="message"
                            rows="4"
                            v-model="form.message"
                            required
                            class="form-control"
                        ></textarea>
                    </div>
                    <button type="submit" style="margin-top: 5%" class="submit-button">
                        Submit
                    </button>
                </form>
            </div>
        </div>
    </main>
</template>

<style scoped>
h1 {
    font-weight: 500;
    font-size: 2.6rem;
    position: relative;
    top: -10px;
}

h2 {
    font-size: 2rem;
}

h3 {
    font-size: 1.2rem;
}

button {
    padding: 0.5rem 1rem;
    border: 1px solid #ccc;
    background: #2c3239;
    color: #fff;
    cursor: pointer;
    border-radius: 4px;
}

label {
    font-size: 1.2rem;
    font-weight: 500;
    margin-bottom: 0.4rem;
    color: var(--color-heading);
}

.pgSpace {
    margin-top: 3%;
}

.greetings h1,
.greetings h3 {
    text-align: center;
}

.form-error {
    color: #c00;
    margin-bottom: 1em;
}

.form-success {
    color: #080;
    margin-bottom: 1em;
    font-size: 1rem;
}
</style>
