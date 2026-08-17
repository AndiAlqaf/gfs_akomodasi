<?php

namespace App\Core;

class Router
{
    private $routes = [];

    public function add($method, $uri, $controllerAction)
    {
        // Convert route parameters like {id} to regex
        $routeRegex = preg_replace('/\{([a-zA-Z0-9_]+)\}/', '(?P<\1>[a-zA-Z0-9_-]+)', $uri);
        $routeRegex = '#^' . $routeRegex . '$#';

        $this->routes[] = [
            'method' => strtoupper($method),
            'uri' => $uri,
            'regex' => $routeRegex,
            'action' => $controllerAction
        ];
    }

    public function get($uri, $controllerAction) { $this->add('GET', $uri, $controllerAction); }
    public function post($uri, $controllerAction) { $this->add('POST', $uri, $controllerAction); }
    public function put($uri, $controllerAction) { $this->add('PUT', $uri, $controllerAction); }
    public function delete($uri, $controllerAction) { $this->add('DELETE', $uri, $controllerAction); }

    public function dispatch($method, $uri)
    {
        // Strip query string from URI
        $uri = parse_url($uri, PHP_URL_PATH);

        foreach ($this->routes as $route) {
            if ($route['method'] === $method && preg_match($route['regex'], $uri, $matches)) {
                
                // Extract named parameters from matches
                $params = [];
                foreach ($matches as $key => $value) {
                    if (is_string($key)) {
                        $params[$key] = $value;
                    }
                }

                // Parse controller and method
                list($controllerClass, $controllerMethod) = explode('@', $route['action']);
                $controllerClass = "App\\Controllers\\" . $controllerClass;

                if (class_exists($controllerClass)) {
                    $controller = new $controllerClass();
                    if (method_exists($controller, $controllerMethod)) {
                        return call_user_func_array([$controller, $controllerMethod], $params);
                    } else {
                        $this->sendNotFound("Method $controllerMethod not found in $controllerClass");
                    }
                } else {
                    $this->sendNotFound("Controller $controllerClass not found");
                }
            }
        }

        return false;
    }

    private function sendNotFound($message)
    {
        http_response_code(404);
        echo json_encode(['error' => $message]);
        exit;
    }
}
