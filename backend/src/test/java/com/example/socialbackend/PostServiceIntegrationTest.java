package com.example.socialbackend;

import com.example.socialbackend.model.Post;
import com.example.socialbackend.model.User;
import com.example.socialbackend.repository.PostRepository;
import com.example.socialbackend.repository.UserRepository;
import com.example.socialbackend.service.PostService;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@SpringBootTest
public class PostServiceIntegrationTest {

    @Autowired
    PostService postService;

    @Autowired
    PostRepository postRepository;

    @Autowired
    UserRepository userRepository;

    @Test
    @Transactional
    public void toggleLike_addsAndRemovesLike() {
        User u = new User();
        u.setEmail("test-user@example.com");
        u.setName("Test");
        u.setPassword("pass");
        userRepository.saveAndFlush(u);

        Post p = new Post();
        p.setContent("hello");
        p.setAuthor(u);
        postRepository.saveAndFlush(p);

        Post afterLike = postService.toggleLike(p.getId(), u.getId());
        Assertions.assertTrue(afterLike.getLikedBy().stream().anyMatch(x -> x.getId().equals(u.getId())));

        Post afterUnlike = postService.toggleLike(p.getId(), u.getId());
        Assertions.assertFalse(afterUnlike.getLikedBy().stream().anyMatch(x -> x.getId().equals(u.getId())));
    }

    @Test
    public void toggleLike_onMissingPost_throwsNotFound() {
        ResponseStatusException ex = Assertions.assertThrows(ResponseStatusException.class, () -> {
            postService.toggleLike(999999L, 1L);
        });
        Assertions.assertEquals(404, ex.getStatusCode().value());
    }
}
