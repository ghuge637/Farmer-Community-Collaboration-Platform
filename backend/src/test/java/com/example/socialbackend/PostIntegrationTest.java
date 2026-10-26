package com.example.socialbackend;

import com.example.socialbackend.model.Post;
import com.example.socialbackend.model.User;
import com.example.socialbackend.repository.PostRepository;
import com.example.socialbackend.repository.UserRepository;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.ResponseEntity;

import java.util.List;
import java.util.Map;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
public class PostIntegrationTest {

    @LocalServerPort
    int port;

    @Autowired
    TestRestTemplate rest;

    @Autowired
    UserRepository users;

    @Autowired
    PostRepository posts;

    @Test
    public void createLikeCommentDelete_flow() {
        // register
        String url = "http://localhost:" + port + "/api/auth/register";
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        String body = "{\"name\":\"Poster\",\"email\":\"post-test@example.com\",\"password\":\"pass123\"}";
        ResponseEntity<Map> res = rest.postForEntity(url, new HttpEntity<>(body, headers), Map.class);
        Assertions.assertEquals(200, res.getStatusCode().value());
        Assertions.assertTrue(res.getBody().containsKey("token"));
        String token = (String) res.getBody().get("token");

        // create post
        String pUrl = "http://localhost:" + port + "/api/posts";
        String postBody = "{\"content\":\"Hello from integration test\"}";
        headers.set("Authorization", "Bearer " + token);
        ResponseEntity<Post> pRes = rest.postForEntity(pUrl, new HttpEntity<>(postBody, headers), Post.class);
        Assertions.assertEquals(200, pRes.getStatusCode().value());
        Post p = pRes.getBody();
        Assertions.assertNotNull(p);
        Assertions.assertEquals("Hello from integration test", p.getContent());

        // like
        String likeUrl = pUrl + "/" + p.getId() + "/like";
        ResponseEntity<Post> likeRes = rest.postForEntity(likeUrl, new HttpEntity<>("{}", headers), Post.class);
        Assertions.assertEquals(200, likeRes.getStatusCode().value());

        // comment
        String commentUrl = pUrl + "/" + p.getId() + "/comment";
        String commentBody = "{\"text\":\"Nice post\"}";
        ResponseEntity<Map> cRes = rest.postForEntity(commentUrl, new HttpEntity<>(commentBody, headers), Map.class);
        Assertions.assertEquals(200, cRes.getStatusCode().value());
        Assertions.assertTrue(cRes.getBody().containsKey("authorName"));

        // delete
        String delUrl = pUrl + "/" + p.getId();
        rest.delete(delUrl, new HttpEntity<>(headers));
        Assertions.assertTrue(posts.findById(p.getId()).isEmpty());
    }
}