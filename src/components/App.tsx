import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { Box, Button, Flex, Text } from 'theme-ui';

interface Post {
  id: string;
  title: string;
  publishDate: string;
  author: {
    name: string;
    avatar: string;
  };
  summary: string;
  categories: Category[];
}

interface Category {
  id: string;
  name: string;
}

const App: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [postsOnPage, setPostsOnPage] = useState<Post[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [filtersOpen, setFiltersOpen] = useState<boolean>(false);
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [page, setPage] = useState<number>(0);
  const [numberOfPages, setNumberOfPages] = useState<number>(0);

  const itemsPerPage = 15;

  async function getPosts() {
    fetch('api/posts')
      .then((resp) => resp.json())
      .then((resp) => setPosts(resp.posts))
      .catch((e) => console.log(e));
  }

  function createCategoryList() {
    const tempCategories: string[] = [];

    if (postsOnPage.length) {
      postsOnPage.forEach((post) => {
        post.categories.forEach((category) => {
          if (!tempCategories.includes(category.name)) {
            tempCategories.push(category.name);
          }
        });
      });
    }

    setCategories([...tempCategories]);
  }

  function filterPost(post: Post): boolean {
    const postCategories = post.categories.map((category) => category.name);
    let showPost = false;

    selectedFilters.forEach((filter) => {
      if (postCategories.includes(filter)) {
        showPost = true;
      }
    });

    return showPost;
  }

  function handlePostsOnPage() {
    let filteredPosts: Post[] = [];

    if (selectedFilters.length === 0) {
      filteredPosts = posts;
    } else {
      posts.forEach((post) => {
        if (filterPost(post)) {
          filteredPosts.push(post);
        }
      });
    }

    setNumberOfPages(Math.ceil(filteredPosts.length / itemsPerPage));

    const tempPosts = filteredPosts.slice(page * itemsPerPage, (page + 1) * itemsPerPage);

    setPostsOnPage([...tempPosts]);
  }

  function handleFilterSelect(category: string) {
    const tempFilters = selectedFilters;

    if (selectedFilters.includes(category)) {
      const index = tempFilters.indexOf(category);
      tempFilters.splice(index, 1);
    } else {
      tempFilters.push(category);
    }

    setSelectedFilters([...tempFilters]);
  }

  useEffect(() => {
    handlePostsOnPage();
  }, [posts, page, selectedFilters]);

  useEffect(() => {
    createCategoryList();
  }, [postsOnPage]);

  useEffect(() => {
    getPosts();
  }, []);

  return (
    <div>
      <Flex
        sx={{
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'column',
        }}
      >
        <Text
          sx={{
            fontWeight: 'bold',
            fontSize: [16, 24],
            margin: '20px 0',
          }}
        >
          Posts
        </Text>

        {!filtersOpen ? (
          <Button
            sx={{
              marginBottom: '10px',
            }}
            onClick={() => setFiltersOpen(true)}
          >
            <Text color="black">Filter</Text>
          </Button>
        ) : (
          <>
            {' '}
            <Button
              sx={{
                marginBottom: '10px',
              }}
              onClick={() => setFiltersOpen(false)}
            >
              <Text color="black">Close</Text>
            </Button>
            <Box>
              {categories.map((category, i) => {
                const isSelected = selectedFilters.includes(category);
                return (
                  <Button
                    sx={{
                      margin: '5px',
                    }}
                    backgroundColor={isSelected ? 'green' : 'lightgrey'}
                    key={`category-${i}`}
                    onClick={() => handleFilterSelect(category)}
                  >
                    <Text color={isSelected ? 'white' : 'black'}>{category}</Text>
                  </Button>
                );
              })}
            </Box>
          </>
        )}
        {posts.length !== 0 ? (
          <Box className="table-wrapper">
            <table className="posts-table">
              <thead>
                <tr>
                  <th className="left">
                    <Text>Title</Text>
                  </th>
                  <th className="left">
                    <Text>Author</Text>
                  </th>
                  <th className="right">
                    <Text>Date Published</Text>
                  </th>
                </tr>
              </thead>
              <tbody>
                {postsOnPage?.map((post, i) => {
                  return (
                    <tr key={`posts-${post.id}`}>
                      <td className="left title">
                        <Text>
                          {i + 1} - {post.title}
                        </Text>
                      </td>
                      <td className="left">
                        <Text>{post.author.name}</Text>
                      </td>
                      <td className="right">
                        <Text>{dayjs(post.publishDate).format('DD-MM-YYYY')}</Text>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Box>
        ) : (
          <Text>Loading...</Text>
        )}
        <Flex
          sx={{
            alignItems: 'center',
            gap: 2,
            margin: '10px 0',
          }}
        >
          <Button disabled={page === 0} onClick={() => setPage(page - 1)}>
            <Text color="black">{'<'}</Text>
          </Button>
          <Text>
            Page {page + 1}/{numberOfPages}
          </Text>
          <Button disabled={page + 1 === numberOfPages} onClick={() => setPage(page + 1)}>
            <Text color="black">{'>'}</Text>
          </Button>
        </Flex>
      </Flex>
    </div>
  );
};

export default App;
